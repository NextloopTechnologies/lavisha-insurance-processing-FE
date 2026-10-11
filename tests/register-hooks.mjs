// Test-only loader: lets Node's ESM resolver load "next/server" (the next package has no exports map).
import { register } from "node:module";

register("./resolve-hooks.mjs", import.meta.url);
