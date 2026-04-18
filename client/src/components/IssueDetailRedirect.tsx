import { Navigate, useParams } from "react-router-dom";

/** Old `/issues/:id` URLs open the issue in the home-page modal instead of a full page. */
export function IssueDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;
  return <Navigate to={`/?issue=${encodeURIComponent(id)}`} replace />;
}
