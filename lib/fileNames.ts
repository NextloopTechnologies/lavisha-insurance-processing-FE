// Stored keys look like `claims/<safeName>_<uuid><ext>`; must match the backend's downloadNameFromKey.
const UUID_SUFFIX = /_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\.[^.]+$|$)/i;

/** Name to show or save a file under: folder and upload UUID removed, extension kept. */
export function displayNameFromKey(key?: string | null): string {
  const base = key?.split("/").pop() || "";
  if (!base) return "";
  const name = base.replace(UUID_SUFFIX, "");
  return !name || name.startsWith(".") ? `document${name}` : name;
}

/** blob: and data: URLs point at a file already in the browser and can be saved directly. */
export const isLocalUrl = (url?: string | null) => !!url && /^(blob|data):/i.test(url);
