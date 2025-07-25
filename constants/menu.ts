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
