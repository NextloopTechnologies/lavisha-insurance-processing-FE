
export enum CommentType {
  NOTE = "NOTE",
  QUERY = "QUERY",
  TPA_REPLY = "TPA_REPLY",
  SYSTEM = "SYSTEM",
  HOSPITAL_NOTE = "HOSPITAL_NOTE",
}

export enum UserRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  HOSPITAL = "HOSPITAL",
  HOSPITAL_MANAGER = "HOSPITAL_MANAGER",
}

export type TComments = {
  message: string;
  sender: string;
  date: string;
  time: string;
  position: string;
  id: string;
  text: string;
  type: CommentType;
  insuranceRequestId: string;
  fileUrl: null;
  createdBy: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
  };
};
