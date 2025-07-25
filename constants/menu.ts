import {
  dashboardImage,
  claimsImage,
  patientImage,
  pendingIcon,
  send1Icon,
  draftIcon,
  faqIcon,
  approveIcon,
  cancelIcon,
  growthIcon,
  dischargeIcon,
  settledIcon,
} from "../assets";

export const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: dashboardImage,
  },
  {
    label: "Claims",
    path: "/claims",
    icon: claimsImage,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: patientImage,
  },
  {
    label: "Queries",
    icon: patientImage,
  },
  { path: "/settlements", label: "Settlements", icon: patientImage },
  { path: "/enhancements", label: "Enhancements", icon: patientImage },
];

export const statusOptions = [
  {
    name: "Pending",
    icon: pendingIcon,
    key: "status",
  },
  {
    name: "Send to TPA",
    icon: send1Icon,

    key: "tpa",
  },
  {
    name: "Draft",
    icon: draftIcon,

    key: "draft",
  },
  {
    name: "Queried",
    icon: faqIcon,

    key: "query",
  },
  {
    name: "Approved",
    icon: approveIcon,
    key: "approved",
  },
  {
    name: "Denied",
    icon: cancelIcon,
    key: "denied",
  },
  {
    name: "Enhancement",
    icon: growthIcon,

    key: "enhancement",
  },
  {
    name: "Dishcharged",
    icon: dischargeIcon,

    key: "discharged",
  },
  {
    name: "Settled",
    icon: settledIcon,
    key: "settled",
  },
];

export const documents = [
  { type: "Document Type 1", icon: true },
  { type: "Document Type 2", icon: true },
  { type: "Document Type 3", icon: false },
  { type: "Document Type 4", icon: false },
  { type: "Document Type 5", icon: false },
  { type: "Document Type 6", icon: false },
  { type: "Misc Document", icon: false },
  { type: "More Document", icon: false },
];
