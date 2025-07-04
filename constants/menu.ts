// export const navItems = [
//   { path: "/", label: "Home" },
//   { path: "/dashboard", label: "Dashboard" },
//   { path: "/claims", label: "Claims" },
//   { path: "/patients", label: "Patients" },
//   { path: "/queries", label: "Queries" },
//   { path: "/settlements", label: "Settlements" },
//   { path: "/enhancements", label: "Enhancements" },
// ];

export const navItems = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Claims",
    children: [
      { label: "All Claims", path: "/claims" },
      { label: "New Claim", path: "/claims/new" },
      {
        label: "Rejected Claims",
        children: [
          { label: "By Patient", path: "/claims/rejected/patient" },
          { label: "By Hospital", path: "/claims/rejected/hospital" },
        ],
      },
    ],
  },
  {
    label: "Patients",
    path: "/patients",
  },
  {
    label: "queries",
    children: [
      { label: "Profile", path: "/queries/profile" },
      { label: "Security", path: "/queries/security" },
    ],
  },
  { path: "/settlements", label: "Settlements" },
  { path: "/enhancements", label: "Enhancements" },
];
