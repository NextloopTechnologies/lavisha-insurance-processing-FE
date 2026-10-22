import { StatusType } from "@/types/claims";
import { STATUS_NAMES } from "@/lib/claimStatus";
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
  dashboardActive,
  claim,
  claimActive,
  patient,
  patientActive,
} from "../assets";

// export const navItems = [
//   {
//     label: "Dashboard",
//     path: "/",
//     icon: dashboardImage,
//     activeIcon: dashboardActive,
//   },
//   {
//     label: "Claims",
//     path: "/claims",
//     icon: claim,
//     activeIcon: claimActive,
//   },
//   {
//     label: "Patients",
//     path: "/patients",
//     icon: patient,
//     activeIcon: patientActive,
//   },
// ];

export const adminNavItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: dashboardImage,
    activeIcon: dashboardActive,
  },
  { label: "Claims", path: "/claims", icon: claim, activeIcon: claimActive },
  {
    label: "Patients",
    path: "/patients",
    icon: patient,
    activeIcon: patientActive,
  },
  {
    label: "Settlements",
    path: "/settlements",
    icon: claim,
    activeIcon: claimActive,
  },
  {
    label: "Manager Chat",
    path: "/manager-chat",
    icon: patient,
    activeIcon: patientActive,
  },
  { label: "User", path: "/user", icon: patient, activeIcon: patientActive },
];

export const hospitalNavItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: dashboardImage,
    activeIcon: dashboardActive,
  },
  { label: "Claims", path: "/claims", icon: claim, activeIcon: claimActive },
  {
    label: "Patients",
    path: "/patients",
    icon: patient,
    activeIcon: patientActive,
  },
];

export const navItems = [
  {
    role: "HOSPITAL",
    menu: [
      {
        label: "Dashboard",
        path: "/",
        icon: dashboardImage,
        activeIcon: dashboardActive,
      },
      {
        label: "Claims",
        path: "/claims",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Patients",
        path: "/patients",
        icon: patient,
        activeIcon: patientActive,
      },
    ],
  },
  {
    role: "HOSPITAL_MANAGER",
    menu: [
      {
        label: "Dashboard",
        path: "/",
        icon: dashboardImage,
        activeIcon: dashboardActive,
      },
      {
        label: "Claims",
        path: "/claims",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Patients",
        path: "/patients",
        icon: patient,
        activeIcon: patientActive,
      },

      {
        label: "Manager Chat",
        path: "/manager-chat",
        icon: patient,
        activeIcon: patientActive,
      },
      // {
      //   label: "User",
      //   path: "/user",
      //   icon: patient,
      //   activeIcon: patientActive,
      // },
    ],
  },
  {
    role: "SUPER_ADMIN",
    menu: [
      {
        label: "Dashboard",
        path: "/",
        icon: dashboardImage,
        activeIcon: dashboardActive,
      },
      {
        label: "Claims",
        path: "/claims",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Patients",
        path: "/patients",
        icon: patient,
        activeIcon: patientActive,
      },
      {
        label: "Settlements",
        path: "/settlements",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Manager Chat",
        path: "/manager-chat",
        icon: patient,
        activeIcon: patientActive,
      },
      {
        label: "User",
        path: "/user",
        icon: patient,
        activeIcon: patientActive,
      },
    ],
  },

  {
    role: "ADMIN",
    menu: [
      {
        label: "Dashboard",
        path: "/",
        icon: dashboardImage,
        activeIcon: dashboardActive,
      },
      {
        label: "Claims",
        path: "/claims",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Patients",
        path: "/patients",
        icon: patient,
        activeIcon: patientActive,
      },
      {
        label: "Settlements",
        path: "/settlements",
        icon: claim,
        activeIcon: claimActive,
      },
      {
        label: "Manager Chat",
        path: "/manager-chat",
        icon: patient,
        activeIcon: patientActive,
      },
      {
        label: "User",
        path: "/user",
        icon: patient,
        activeIcon: patientActive,
      },
    ],
  },
];

// display order; names and transitions live in lib/claimStatus
export const statusOptions = [
  { name: STATUS_NAMES[StatusType.DRAFT], icon: draftIcon, key: StatusType.DRAFT },
  { name: STATUS_NAMES[StatusType.PENDING], icon: pendingIcon, key: StatusType.PENDING },
  { name: STATUS_NAMES[StatusType.SENT_TO_TPA], icon: send1Icon, key: StatusType.SENT_TO_TPA },
  { name: STATUS_NAMES[StatusType.APPROVED], icon: approveIcon, key: StatusType.APPROVED },
  { name: STATUS_NAMES[StatusType.QUERIED], icon: faqIcon, key: StatusType.QUERIED },
  { name: STATUS_NAMES[StatusType.QUERY_REPLY_SENT], icon: send1Icon, key: StatusType.QUERY_REPLY_SENT },
  { name: STATUS_NAMES[StatusType.ENHANCEMENT], icon: growthIcon, key: StatusType.ENHANCEMENT },
  { name: STATUS_NAMES[StatusType.DENIED], icon: cancelIcon, key: StatusType.DENIED },
  { name: STATUS_NAMES[StatusType.DISCHARGE_INITIATED], icon: dischargeIcon, key: StatusType.DISCHARGE_INITIATED },
  { name: STATUS_NAMES[StatusType.DISCHARGE_SENT], icon: send1Icon, key: StatusType.DISCHARGE_SENT },
  { name: STATUS_NAMES[StatusType.DISCHARGED], icon: approveIcon, key: StatusType.DISCHARGED },
  { name: STATUS_NAMES[StatusType.SETTLEMENT_INITIATED], icon: pendingIcon, key: StatusType.SETTLEMENT_INITIATED },
  { name: STATUS_NAMES[StatusType.SETTLED], icon: settledIcon, key: StatusType.SETTLED },
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

export const TPA_OPTIONS = [
  "PARAMOUNT TPA",
  "RAKSHA TPA",
  "MD INDIA",
  "MEDI ASSIST",
  "HEALTH INDIA TPA",
  "FAMILY HEALTH TPA",
  "VIDAL HEALTH TPA",
  "GENINS INDIA TPA",
  "HEALTH INSURANCE TPA",
  "VIPULMEDCORP TPA",
  "HERITAGE TPA",
  "GOOD HEALTH INDIA TPA",
  "MEDSAVE TPA",
  "Anmol Medicare",
  "Ericson TPA",
  "United Healthcare Parekh",
  "East West TPA",
  "PARK MEDICLAIM",
  "SAFEWAY",
  "VOLO",
];

export const INSURANCE_COMPANIES = [
  "STAR HEALTH",
  "IFFCO TOKIO",
  "MS CHOLAMANDALAM",
  "CARE HEALTH",
  "ICICI LOMBARD",
  "FUTURE GENERALI",
  "Aditya Birla",
  "TATA AIG",
  "Universal Sompo",
  "Niva Bupa",
  "MANIPAL CIGNA",
  "Navi General",
  "Bajaj Allianz",
  "HDFC Ergo",
  "Liberty General Insurance",
  "Reliance Ceda",
  "ACKO GENERAL INSURANCE",
  "CHOLA MS",
  "GO DIGIT",
  "ICICI PRUDENTIAL",
  "KOTAK",
  "MAGMA",
  "RAHEJA QBE GENERAL INSURANCE",
  "RELIANCE GENERAL INSURANCE",
  "SBI GENERAL INS",
  "ROYAL SUNDARAM",
  "NEW INDIA INSURANCE COMP",
  "ORIENTAL INSURANCE COMP",
  "NATIONAL INSURANCE COMP",
  "UNITED INDIA INSURANCE COMP",
];
