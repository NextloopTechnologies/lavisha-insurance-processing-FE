export const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: "assets/dashboard.png",
  },
  {
    label: "Claims",
path: "/claims",
    icon: "assets/claims.png",

    // children: [
    //   { label: "All Claims", path: "/claims", icon: "assets/claims.png" },
    //   { label: "New Claim", path: "/claims/new", icon: "assets/claims.png" },
    //   {
    //     label: "Rejected Claims",
    //     icon: "assets/claims.png",

    //     children: [
    //       {
    //         label: "By Patient",
    //         path: "/claims/rejected/patient",
    //         icon: "assets/patient.png",
    //       },
    //       {
    //         label: "By Hospital",
    //         path: "/claims/rejected/hospital",
    //         icon: "assets/patient.png",
    //       },
    //     ],
    //   },
    // ],
  },
  {
    label: "Patients",
    path: "/patients",
    icon: "assets/patient.png",
  },
  {
    label: "queries",
    icon: "assets/patient.png",
    children: [
      {
        label: "Profile",
        path: "/queries/profile",
        icon: "assets/patient.png",
      },
      {
        label: "Security",
        path: "/queries/security",
        icon: "assets/patient.png",
      },
    ],
  },
  { path: "/settlements", label: "Settlements", icon: "assets/patient.png" },
  { path: "/enhancements", label: "Enhancements", icon: "assets/patient.png" },
];
