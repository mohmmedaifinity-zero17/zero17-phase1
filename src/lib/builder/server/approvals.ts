// src/lib/builder/server/approvals.ts

export type PromotionApprovalRequest = {
  id: string;
  type: "agent_promotion";
  agentId: string;
  createdAt: string;
  status: "pending" | "approved" | "denied";
  reason?: string;
  metrics?: any;
};

export function ensureApprovals(project: any) {
  project.approvals = project.approvals || [];
  return project.approvals as PromotionApprovalRequest[];
}

export function createApproval(
  project: any,
  req: Omit<PromotionApprovalRequest, "status">
) {
  const approvals = ensureApprovals(project);
  const full: PromotionApprovalRequest = { ...req, status: "pending" };
  approvals.push(full);
  project.updated_at = new Date().toISOString();
  return full;
}

export function resolveApproval(
  project: any,
  id: string,
  status: "approved" | "denied"
) {
  const approvals = ensureApprovals(project);
  const r = approvals.find((x) => x.id === id);
  if (!r) return null;
  r.status = status;
  project.updated_at = new Date().toISOString();
  return r;
}
