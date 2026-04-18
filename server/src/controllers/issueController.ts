import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import mongoose from "mongoose";
import {
  Issue,
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type IssueStatus,
} from "../models/Issue";
import { HttpError } from "../middleware/errorHandler";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().min(1).max(10000),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  severity: z.enum(ISSUE_SEVERITIES).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
});

const updateSchema = createSchema.partial();

const filterQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  severity: z.enum(ISSUE_SEVERITIES).optional(),
});

const listQuerySchema = filterQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const exportQuerySchema = filterQuerySchema.extend({
  format: z.enum(["json", "csv"]).default("json"),
  limit: z.coerce.number().int().min(1).max(5000).default(5000),
});

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toIssueDto(doc: { _id: unknown; title: string; description: string; status: string; priority: string; severity: string; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    priority: doc.priority,
    severity: doc.severity,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export function createIssueController() {
  const list: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const q = listQuerySchema.parse(req.query);

    const filter: Record<string, unknown> = { createdBy: new ObjectId(uid) };
    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.severity) filter.severity = q.severity;
    if (q.q) {
      const safe = escapeRegex(q.q);
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      Issue.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(q.limit).lean(),
      Issue.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / q.limit));
    res.json({
      items: items.map((d) => toIssueDto(d)),
      page: q.page,
      limit: q.limit,
      total,
      totalPages,
    });
  };

  const stats: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const oid = new ObjectId(uid);
    const agg = await Issue.aggregate<{ _id: IssueStatus; count: number }>([
      { $match: { createdBy: oid } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(agg.map((a) => [a._id, a.count])) as Record<string, number>;
    const counts = {
      open: map.open ?? 0,
      in_progress: map.in_progress ?? 0,
      resolved: map.resolved ?? 0,
      closed: map.closed ?? 0,
    };
    res.json(counts);
  };

  const getOne: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "Invalid issue id");
    }
    const issue = await Issue.findOne({
      _id: id,
      createdBy: uid,
    }).lean();
    if (!issue) {
      throw new HttpError(404, "Issue not found");
    }
    res.json(toIssueDto(issue));
  };

  const create: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const body = createSchema.parse(req.body);
    const issue = await Issue.create({
      ...body,
      createdBy: uid,
    });
    res.status(201).json(toIssueDto(issue.toObject()));
  };

  const update: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "Invalid issue id");
    }
    const body = updateSchema.parse(req.body);
    const issue = await Issue.findOneAndUpdate({ _id: id, createdBy: uid }, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!issue) {
      throw new HttpError(404, "Issue not found");
    }
    res.json(toIssueDto(issue));
  };

  const remove: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "Invalid issue id");
    }
    const result = await Issue.deleteOne({ _id: id, createdBy: uid });
    if (result.deletedCount === 0) {
      throw new HttpError(404, "Issue not found");
    }
    res.status(204).send();
  };

  const exportData: RequestHandler = async (req, res) => {
    const uid = req.userId;
    if (!uid) throw new HttpError(401, "Not authenticated");
    const q = exportQuerySchema.parse(req.query);
    const format = q.format;

    const filter: Record<string, unknown> = { createdBy: new ObjectId(uid) };
    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.severity) filter.severity = q.severity;
    if (q.q) {
      const safe = escapeRegex(q.q);
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const items = await Issue.find(filter).sort({ updatedAt: -1 }).limit(q.limit).lean();
    const rows = items.map((d) => toIssueDto(d));

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'attachment; filename="issues.json"');
      res.send(JSON.stringify(rows, null, 2));
      return;
    }

    const headers = ["id", "title", "description", "status", "priority", "severity", "createdAt", "updatedAt"];
    const lines = [headers.join(",")];
    for (const r of rows) {
      const line = headers.map((h) => {
        const v = r[h as keyof typeof r];
        const s = v == null ? "" : String(v);
        if (s.includes('"') || s.includes(",") || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      });
      lines.push(line.join(","));
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="issues.csv"');
    res.send(lines.join("\n"));
  };

  return { list, stats, getOne, create, update, remove, exportData };
}
