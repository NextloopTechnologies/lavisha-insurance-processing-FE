import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware, config } from "../middleware.ts";

const BASE = "http://localhost:3000";

const b64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// shape-only token, like the API's: header.payload.signature
const token = (payload: object) => `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.signature`;
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
const tokenFor = (role: string) => token({ sub: "u1", role, exp: inOneHour() });

function run(path: string, cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  const res = middleware(new NextRequest(`${BASE}${path}`, { headers: cookie ? { cookie } : {} }));
  const location = res.headers.get("location");
  return {
    status: res.status,
    to: location ? new URL(location).pathname : null,
    passed: res.headers.get("x-middleware-next") === "1",
    setCookie: res.headers.get("set-cookie") ?? "",
  };
}

const PROTECTED = [
  "/", "/claims", "/claims/CLM-00001", "/newClaim", "/newClaim/CLM-00001", "/patients",
  "/settlements", "/manager-chat", "/user", "/user/abc", "/dashboard", "/unauthorized",
];

describe("middleware: authentication", () => {
  for (const path of PROTECTED) {
    it(`redirects ${path} to /login without a token`, () => {
      const r = run(path);
      assert.equal(r.status, 307);
      assert.equal(r.to, "/login");
    });
  }

  it("lets /login through without a token", () => {
    assert.ok(run("/login").passed);
  });

  it("sends a logged-in user from /login to /", () => {
    assert.equal(run("/login", { access_token: tokenFor("HOSPITAL") }).to, "/");
  });

  it("treats an expired token as logged out and clears the auth cookies", () => {
    const expired = token({ sub: "u1", role: "ADMIN", exp: Math.floor(Date.now() / 1000) - 5 });
    const r = run("/claims", { access_token: expired, user_role: "ADMIN" });
    assert.equal(r.to, "/login");
    assert.match(r.setCookie, /access_token=;/);
    assert.match(r.setCookie, /user_role=;/);
  });

  it("lets an expired-token user see /login instead of bouncing back to /", () => {
    const expired = token({ sub: "u1", role: "ADMIN", exp: Math.floor(Date.now() / 1000) - 5 });
    assert.ok(run("/login", { access_token: expired }).passed);
  });

  for (const [label, value] of [
    ["a non-JWT string", "not-a-jwt"],
    ["a JWT with an unparseable payload", "aaa.%%%%.bbb"],
    ["a JWT with no role", token({ sub: "u1", exp: inOneHour() })],
    ["an empty token", ""],
  ] as const) {
    it(`redirects to /login with ${label}`, () => {
      assert.equal(run("/claims", { access_token: value }).to, "/login");
    });
  }

  it("accepts a token without exp (role still required)", () => {
    assert.ok(run("/claims", { access_token: token({ sub: "u1", role: "HOSPITAL" }) }).passed);
  });

  it("decodes base64url payloads that need - _ and padding", () => {
    // this name makes the base64 contain + and / before url-encoding, and needs padding
    const tricky = token({ sub: "u1", role: "ADMIN", exp: inOneHour(), name: "??>>~~ é" });
    assert.ok(tricky.split(".")[1].match(/[-_]/), "fixture should contain base64url characters");
    assert.ok(run("/user", { access_token: tricky }).passed);
  });
});

describe("middleware: role checks (role comes from the token)", () => {
  // expected access, written out independently of ROLE_PERMISSIONS
  const allow: Record<string, string[]> = {
    HOSPITAL: ["/", "/dashboard", "/claims", "/claims/CLM-1", "/settlements", "/patients", "/newClaim", "/newClaim/CLM-1"],
    HOSPITAL_MANAGER: ["/", "/claims", "/claims/CLM-1", "/settlements", "/patients", "/manager-chat"],
    ADMIN: ["/", "/dashboard", "/claims", "/claims/CLM-1", "/settlements", "/patients", "/newClaim", "/newClaim/CLM-1", "/manager-chat", "/user", "/user/abc"],
    SUPER_ADMIN: ["/", "/dashboard", "/claims", "/claims/CLM-1", "/settlements", "/patients", "/manager-chat", "/user", "/user/abc"],
  };
  const deny: Record<string, string[]> = {
    HOSPITAL: ["/user", "/user/abc", "/manager-chat"],
    HOSPITAL_MANAGER: ["/user", "/user/abc", "/newClaim", "/newClaim/CLM-1", "/dashboard"],
    ADMIN: [],
    SUPER_ADMIN: ["/newClaim", "/newClaim/CLM-1"],
  };

  for (const role of Object.keys(allow)) {
    for (const path of allow[role]) {
      it(`${role} can open ${path}`, () => {
        assert.ok(run(path, { access_token: tokenFor(role) }).passed);
      });
    }
    for (const path of deny[role]) {
      it(`${role} is sent to /unauthorized from ${path}`, () => {
        const r = run(path, { access_token: tokenFor(role) });
        assert.equal(r.status, 307);
        assert.equal(r.to, "/unauthorized");
      });
    }
  }

  it("ignores a forged user_role cookie (HOSPITAL token, SUPER_ADMIN cookie)", () => {
    assert.equal(run("/user", { access_token: tokenFor("HOSPITAL"), user_role: "SUPER_ADMIN" }).to, "/unauthorized");
  });

  it("ignores a stale user_role cookie (ADMIN token, HOSPITAL cookie)", () => {
    assert.ok(run("/user", { access_token: tokenFor("ADMIN"), user_role: "HOSPITAL" }).passed);
  });

  it("does not treat /userprofile as /user or /claimsx as /claims (prefix boundary)", () => {
    assert.ok(run("/userprofile", { access_token: tokenFor("HOSPITAL") }).passed);
    assert.ok(run("/newClaimsList", { access_token: tokenFor("HOSPITAL_MANAGER") }).passed);
  });

  it("an unknown role gets only the routes without a role list", () => {
    assert.equal(run("/claims", { access_token: tokenFor("SOMETHING_ELSE") }).to, "/unauthorized");
    assert.ok(run("/unauthorized", { access_token: tokenFor("SOMETHING_ELSE") }).passed);
  });
});

describe("middleware: matcher", () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);

  for (const path of ["/", "/login", "/claims", "/claims/CLM-1", "/newClaim/CLM-1", "/user", "/user/x", "/unauthorized", "/patients"]) {
    it(`runs on ${path}`, () => assert.ok(matcher.test(path)));
  }
  for (const path of [
    "/_next/static/chunks/app.js", "/_next/image", "/sw.js", "/workbox-0933bf7a.js", "/manifest.json",
    "/site.webmanifest", "/assets/Logo.svg", "/favicon.ico", "/android-chrome-192x192.png", "/api/anything",
  ]) {
    it(`skips ${path}`, () => assert.ok(!matcher.test(path)));
  }
});
