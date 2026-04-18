import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { CSSProperties, MutableRefObject } from "react";
import { useMemo, useRef, useState } from "react";
import type { To } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Issue, IssueStatus } from "../../types/issue";
import { cardHoverTransition, dragOverlayTransition, dragOverlayVariants } from "../../lib/motionPresets";
import { compareIssuesByPrioritySeverityUpdated } from "../../lib/issueSort";
import { PriorityBadge } from "../IssueBadges";
import { Card } from "../ui/Card";
import { cn } from "../../lib/cn";

const COLUMNS: { id: IssueStatus; title: string }[] = [
  { id: "open", title: "Open" },
  { id: "in_progress", title: "In progress" },
  { id: "resolved", title: "Resolved" },
  { id: "closed", title: "Closed" },
];

function statusFromOver(over: DragEndEvent["over"]): IssueStatus | undefined {
  if (!over) return;
  const d = over.data.current as
    | { type?: string; status?: IssueStatus; issue?: Issue }
    | undefined;
  if (d?.type === "column" && d.status) return d.status;
  if (d?.type === "issue" && d.issue) return d.issue.status;
  return;
}

function BoardColumn({
  status,
  title,
  issues,
  suppressLinkNavUntilRef,
  issueTo,
}: {
  status: IssueStatus;
  title: string;
  issues: Issue[];
  suppressLinkNavUntilRef: MutableRefObject<number>;
  issueTo: (issueId: string) => To;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status}`,
    data: { type: "column", status },
  });

  return (
    <motion.div
      className="flex h-full min-h-0 w-[min(100%,280px)] shrink-0 flex-col lg:min-w-0 lg:w-0 lg:max-w-none lg:flex-1"
      animate={isOver ? { scale: 1.008 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1">
        <h3 className="text-[0.8rem] font-semibold uppercase tracking-wide text-muted">{title}</h3>
        <span className="rounded-md bg-surface-800 px-2 py-0.5 font-mono text-xs text-muted">{issues.length}</span>
      </div>
      <Card
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden p-0",
          isOver && "border-accent/50 ring-1 ring-accent/30"
        )}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "app-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-2 [-webkit-overflow-scrolling:touch]",
            issues.length === 0 && "min-h-[120px] items-center justify-center"
          )}
        >
          {issues.length === 0 ? (
            <p className="px-2 text-center text-xs text-muted/80">Drop issues here</p>
          ) : (
            issues.map((issue) => (
              <DraggableIssueCard
                key={issue.id}
                issue={issue}
                issueTo={issueTo}
                suppressLinkNavUntilRef={suppressLinkNavUntilRef}
              />
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function IssueCardFace({
  issue,
  dragHandleProps,
  suppressLinkNavUntilRef,
  issueTo,
}: {
  issue: Issue;
  dragHandleProps?: Record<string, unknown>;
  suppressLinkNavUntilRef?: MutableRefObject<number>;
  issueTo: (issueId: string) => To;
}) {
  return (
    <div className="flex items-start gap-1.5 p-2.5">
      <button
        type="button"
        className="mt-0.5 shrink-0 touch-none rounded p-0.5 text-muted hover:bg-white/5 hover:text-foreground cursor-grab active:cursor-grabbing"
        {...(dragHandleProps ?? {})}
        aria-label={`Drag to change status: ${issue.title}`}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <Link
        to={issueTo(issue.id)}
        className="min-w-0 flex-1 no-underline"
        onClickCapture={(e) => {
          if (suppressLinkNavUntilRef && Date.now() < suppressLinkNavUntilRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <p className="text-sm font-semibold leading-snug text-foreground hover:text-accent">{issue.title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{issue.description}</p>
        <div className="mt-2">
          <PriorityBadge priority={issue.priority} />
        </div>
      </Link>
    </div>
  );
}

function DraggableIssueCard({
  issue,
  issueTo,
  suppressLinkNavUntilRef,
}: {
  issue: Issue;
  issueTo: (issueId: string) => To;
  suppressLinkNavUntilRef: MutableRefObject<number>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    data: { type: "issue", issue },
  });

  // With DragOverlay, do not move the source with transform (avoids double image + scale jitter).
  const style: CSSProperties = {
    transform: isDragging ? undefined : transform ? CSS.Transform.toString(transform) : undefined,
    opacity: isDragging ? 0 : 1,
    transition: isDragging ? "none" : undefined,
    pointerEvents: isDragging ? "none" : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={!isDragging ? { y: -2 } : undefined}
      transition={cardHoverTransition}
      className={cn(
        "shrink-0 rounded-lg border border-border/90 bg-surface-900/90 shadow-sm",
        !isDragging && "transition-shadow"
      )}
    >
      <IssueCardFace
        issue={issue}
        issueTo={issueTo}
        dragHandleProps={{ ...listeners, ...attributes }}
        suppressLinkNavUntilRef={suppressLinkNavUntilRef}
      />
    </motion.div>
  );
}

function DraggingCardPreview({
  issue,
  issueTo,
}: {
  issue: Issue;
  issueTo: (issueId: string) => To;
}) {
  return (
    <motion.div
      className="pointer-events-none w-[min(260px,calc(100vw-2rem))] cursor-grabbing rounded-lg border border-border/90 bg-surface-900/95 shadow-xl ring-2 ring-accent/25"
      style={{ touchAction: "none" }}
      variants={dragOverlayVariants}
      initial="hidden"
      animate="visible"
      transition={dragOverlayTransition}
    >
      <IssueCardFace issue={issue} issueTo={issueTo} />
    </motion.div>
  );
}

interface Props {
  issues: Issue[];
  issueTo: (issueId: string) => To;
  onStatusChange: (issueId: string, status: IssueStatus) => Promise<void>;
}

export function IssueBoard({ issues, issueTo, onStatusChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  /** After drag end/cancel, block stray pointer-up from activating the card link (ghost click). */
  const suppressLinkNavUntilRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const byStatus = useMemo(() => {
    const map: Record<IssueStatus, Issue[]> = {
      open: [],
      in_progress: [],
      resolved: [],
      closed: [],
    };
    for (const i of issues) {
      if (map[i.status]) map[i.status].push(i);
    }
    for (const s of COLUMNS) {
      map[s.id].sort(compareIssuesByPrioritySeverityUpdated);
    }
    return map;
  }, [issues]);

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : undefined;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragCancel() {
    setActiveId(null);
    suppressLinkNavUntilRef.current = Date.now() + 400;
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    suppressLinkNavUntilRef.current = Date.now() + 400;
    const { active, over } = e;
    if (!over) return;
    const issueId = String(active.id);
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;
    const next = statusFromOver(over);
    if (!next || next === issue.status) return;
    await onStatusChange(issueId, next);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        onDragEnd={(e) => void onDragEnd(e)}
      >
        <div className="flex h-full min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch] sm:gap-4 lg:min-h-0 lg:overflow-x-auto lg:pb-2">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              status={col.id}
              title={col.title}
              issues={byStatus[col.id]}
              issueTo={issueTo}
              suppressLinkNavUntilRef={suppressLinkNavUntilRef}
            />
          ))}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 220,
            easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
          style={{ zIndex: 60 }}
        >
          {activeIssue ? <DraggingCardPreview issue={activeIssue} issueTo={issueTo} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
