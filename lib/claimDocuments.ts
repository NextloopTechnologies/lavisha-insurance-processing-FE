// Every document slot holds a list, so each upload window accepts several files at once.

/** Document slots on the claim form, in display order. */
export const CLAIM_DOC_TYPES = [
  "PRE_AUTH",
  "ICP",
  "CLINIC_PAPER",
  "PAST_INVESTIGATION",
  "CURRENT_INVESTIGATION",
  "OTHER",
] as const;

/** Slot types whose files each need a note (remark). */
export const REMARK_DOC_TYPES = ["OTHER", "DISCHARGE_OTHER", "SETTLEMENT_OTHER"];

export const PLACEHOLDER_REMARK = "custom remark";

export function asArray<T = any>(value: T | T[] | "" | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/** Groups saved documents into `{ [type]: Doc[] }` for the given slot types. */
export function groupDocuments(documents: any[] = [], types: readonly string[]) {
  const grouped: Record<string, any[]> = Object.fromEntries(types.map((type) => [type, []]));
  for (const doc of documents) {
    if (!grouped[doc.type]) continue;
    grouped[doc.type].push({
      id: doc.id,
      fileName: doc.fileName,
      type: doc.type,
      url: doc.url,
      ...(REMARK_DOC_TYPES.includes(doc.type) && { remark: doc.remark }),
    });
  }
  return grouped;
}

/** The API shape of a document: no local-only fields. */
export const toApiDocument = ({ url, file, isNew, ...rest }: any) => rest;

/** Flattens the slots into an API `documents` array, optionally only newly uploaded files. */
export function collectDocuments(inputs: any, types: readonly string[], { onlyNew = false } = {}) {
  return types
    .flatMap((type) => asArray(inputs?.[type]))
    .filter((doc) => doc && (!onlyNew || doc.isNew))
    .map(toApiDocument);
}

/** True when any file in a remark slot still lacks a real note. */
export function hasMissingRemarks(inputs: any, types: readonly string[]) {
  return types
    .filter((type) => REMARK_DOC_TYPES.includes(type))
    .flatMap((type) => asArray(inputs?.[type]))
    .some((doc) => !doc?.remark?.trim() || doc.remark === PLACEHOLDER_REMARK);
}

/** Removes one file (by id, or by S3 key for unsaved uploads) from its slot. */
export function removeFromSlot(inputs: any, removed: any) {
  return {
    ...inputs,
    [removed.type]: asArray(inputs?.[removed.type]).filter((doc: any) =>
      removed.id && doc.id ? doc.id !== removed.id : doc.fileName !== removed.fileName,
    ),
  };
}

/** Appends freshly uploaded files (bulk upload response) to their slot. */
export function appendUploads(inputs: any, type: string, uploaded: { key: string }[], files: File[]) {
  const added = uploaded.map((result, index) => ({
    fileName: result.key,
    type,
    file: files[index],
    isNew: true,
    ...(REMARK_DOC_TYPES.includes(type) && { remark: PLACEHOLDER_REMARK }),
  }));
  return { ...inputs, [type]: [...asArray(inputs?.[type]), ...added] };
}

/** Updates the note of one file in a remark slot. */
export function setRemark(inputs: any, type: string, fileName: string, remark: string) {
  return {
    ...inputs,
    [type]: asArray(inputs?.[type]).map((doc: any) =>
      doc?.fileName === fileName || doc?.name === fileName ? { ...doc, remark } : doc,
    ),
  };
}
