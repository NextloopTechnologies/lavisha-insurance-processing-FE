import { StatusType } from "@/types/claims";

// Pre-auth -> query -> discharge -> settlement (requirement #13); enhancement after approval.

/** Display names. DISCHARGED is "Discharge Approved". */
export const STATUS_NAMES: Record<StatusType, string> = {
  [StatusType.DRAFT]: "Draft",
  [StatusType.PENDING]: "Pre-Auth Pending",
  [StatusType.SENT_TO_TPA]: "Pre-Auth Sent to TPA",
  [StatusType.APPROVED]: "Pre-Auth Approved",
  [StatusType.QUERIED]: "Query",
  [StatusType.QUERY_REPLY_SENT]: "Query Reply Sent",
  [StatusType.ENHANCEMENT]: "Enhancement",
  [StatusType.DENIED]: "Pre-Auth Denied",
  [StatusType.DISCHARGE_INITIATED]: "Discharge Initiated",
  [StatusType.DISCHARGE_SENT]: "Discharge Sent",
  [StatusType.DISCHARGED]: "Discharge Approved",
  [StatusType.SETTLEMENT_INITIATED]: "Settlement Initiated",
  [StatusType.SETTLED]: "Settled",
};

/** Where a claim can go next from each status. */
export const NEXT_STATUSES: Record<StatusType, StatusType[]> = {
  [StatusType.DRAFT]: [StatusType.PENDING],
  [StatusType.PENDING]: [StatusType.SENT_TO_TPA],
  [StatusType.SENT_TO_TPA]: [StatusType.APPROVED, StatusType.QUERIED, StatusType.DENIED],
  [StatusType.QUERIED]: [StatusType.QUERY_REPLY_SENT],
  [StatusType.QUERY_REPLY_SENT]: [StatusType.APPROVED, StatusType.QUERIED, StatusType.DENIED],
  [StatusType.DENIED]: [StatusType.APPROVED], // TPA reverses a denial
  [StatusType.ENHANCEMENT]: [StatusType.APPROVED, StatusType.QUERIED, StatusType.DENIED],
  [StatusType.APPROVED]: [StatusType.DISCHARGE_INITIATED, StatusType.ENHANCEMENT, StatusType.QUERIED],
  [StatusType.DISCHARGE_INITIATED]: [StatusType.DISCHARGE_SENT],
  [StatusType.DISCHARGE_SENT]: [StatusType.DISCHARGED],
  [StatusType.DISCHARGED]: [StatusType.SETTLEMENT_INITIATED],
  [StatusType.SETTLEMENT_INITIATED]: [StatusType.SETTLED],
  [StatusType.SETTLED]: [],
};

/** The current status followed by the statuses it can move to. */
export function statusChoices(current: string): StatusType[] {
  if (!(current in NEXT_STATUSES)) return [];
  return [current as StatusType, ...NEXT_STATUSES[current as StatusType]];
}
