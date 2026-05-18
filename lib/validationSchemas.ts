import * as Yup from "yup";

// ---------------------------------------------------------------------------
// CreateUser — ADD mode
// Validates all fields; rateList & profile photo are excluded.
// Address + hospitalId are conditionally required based on role.
// ---------------------------------------------------------------------------
export const buildUserAddSchema = (role: string) =>
  Yup.object({
    role: Yup.string().required("Role is required"),
    name: Yup.string().trim().required("Name is required"),
    email: Yup.string().trim().required("ID / Email is required"),
    password: Yup.string().required("Password is required"),
    ...(role === "HOSPITAL"
      ? {
          address: Yup.string().trim().required("Address is required"),
        }
      : {}),
    ...(role === "HOSPITAL_MANAGER"
      ? {
          hospitalId: Yup.string().required("Hospital is required"),
          address: Yup.string().trim().required("Address is required"),
        }
      : {}),
  });

// ---------------------------------------------------------------------------
// CreateUser — EDIT mode
// Email/ID is read-only so it is NOT re-validated.
// SUPER_ADMIN is blocked at the component level before this runs.
// ---------------------------------------------------------------------------
export const buildUserEditSchema = (role: string) =>
  Yup.object({
    name: Yup.string().trim().required("Name is required"),
    ...(role === "HOSPITAL"
      ? {
          address: Yup.string().trim().required("Address is required"),
        }
      : {}),
    ...(role === "HOSPITAL_MANAGER"
      ? {
          hospitalId: Yup.string().required("Hospital is required"),
          address: Yup.string().trim().required("Address is required"),
        }
      : {}),
  });

// ---------------------------------------------------------------------------
// ProfileEditModal
// Name is always required.
// Address is required only for hospital (non-admin) users.
// Profile photo and rateList are intentionally NOT validated.
// ---------------------------------------------------------------------------
export const buildProfileEditSchema = (isAdminOrSuperAdmin: boolean) =>
  Yup.object({
    name: Yup.string().trim().required("Name is required"),
    ...(!isAdminOrSuperAdmin
      ? { address: Yup.string().trim().required("Address is required") }
      : {}),
  });
