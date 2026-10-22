export enum StatusType {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT_TO_TPA = 'SENT_TO_TPA',
    QUERIED = 'QUERIED',
    QUERY_REPLY_SENT = 'QUERY_REPLY_SENT',
    DENIED = 'DENIED',
    APPROVED = 'APPROVED',
    ENHANCEMENT = 'ENHANCEMENT',
    DISCHARGE_INITIATED = 'DISCHARGE_INITIATED',
    DISCHARGE_SENT = 'DISCHARGE_SENT',
    DISCHARGED = 'DISCHARGED', // shown as "Discharge Approved"
    SETTLEMENT_INITIATED = 'SETTLEMENT_INITIATED',
    SETTLED = 'SETTLED'
}

export type StatusMetaDataType = {
    name: string;
    icon: string;
    key: string;
}