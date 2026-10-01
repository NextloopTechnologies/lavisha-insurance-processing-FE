// Test-only ESM resolve hooks for `node --test`:
// - "next/server" -> "next/server.js" (the next package has no exports map)
// - "@/foo" -> "<project root>/foo(.ts|.tsx|.js)" (tsconfig path alias)
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return nextResolve("next/server.js", context);

  if (specifier.startsWith("@/")) {
    const base = fileURLToPath(new URL(specifier.slice(2), root));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}/index.ts`]) {
      if (existsSync(candidate) && !candidate.endsWith("/")) {
        try {
          return nextResolve(pathToFileURL(candidate).href, context);
        } catch {
          // directory or unreadable; try the next candidate
        }
      }
    }
  }

  return nextResolve(specifier, context);
}
