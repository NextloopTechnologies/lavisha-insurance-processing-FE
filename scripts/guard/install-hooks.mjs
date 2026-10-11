#!/usr/bin/env node
// Points git at .githooks so the pre-commit guard runs. Runs from `npm install`
// (prepare); does nothing outside a git checkout (e.g. on Vercel builds).
import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  // not a git checkout, or git unavailable: nothing to install
}
