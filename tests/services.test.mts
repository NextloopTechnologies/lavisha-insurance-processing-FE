import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ---- minimal browser globals for js-cookie / localStorage / Cache Storage ----
const cookieWrites: string[] = [];
let cookieJar: Record<string, string> = {};
const store = new Map<string, string>();
let cacheNames: string[] = [];
const deletedCaches: string[] = [];

const g = globalThis as any;
g.document = {
  get cookie() {
    return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
  },
  set cookie(value: string) {
    cookieWrites.push(value);
    const [pair, ...attrs] = value.split("; ");
    const [name, v] = pair.split("=");
    if (attrs.some((a) => /^expires=/i.test(a) && new Date(a.slice(8)) < new Date())) delete cookieJar[name];
    else cookieJar[name] = v;
  },
};
g.caches = {
  keys: async () => [...cacheNames],
  delete: async (name: string) => {
    deletedCaches.push(name);
    cacheNames = cacheNames.filter((n) => n !== name);
    return true;
  },
};
g.window = { location: { protocol: "https:", href: "" }, caches: g.caches };
g.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => store.set(k, String(v)),
  removeItem: (k: string) => store.delete(k),
};

const { default: api } = await import("@/lib/axios");
const comments = await import("@/services/comments");
const { getDashboardByDate } = await import("@/services/dashboard");
const auth = await import("@/services/auth");

// capture requests instead of sending them
type Captured = { method?: string; url?: string; params?: any; data?: any; uri: string };
let requests: Captured[] = [];
let nextResponse: any = { status: 200, data: [] };
api.defaults.adapter = async (config: any) => {
  requests.push({ method: config.method, url: config.url, params: config.params, data: config.data, uri: api.getUri(config) });
  return { status: 200, statusText: "OK", headers: {}, config, data: nextResponse.data };
};

beforeEach(() => {
  requests = [];
  cookieWrites.length = 0;
  nextResponse = { status: 200, data: [] };
});

describe("comments service: no role sent, params encoded", () => {
  it("getComments sends only insuranceRequestId", async () => {
    await comments.getComments({ insuranceRequestId: "claim-1" });
    assert.equal(requests[0].url, "/comments");
    assert.deepEqual(requests[0].params, { insuranceRequestId: "claim-1" });
    assert.ok(!requests[0].uri.includes("role"));
  });

  it("getComments URL-encodes the id", async () => {
    await comments.getComments({ insuranceRequestId: "a b&role=ADMIN" });
    assert.ok(!/[?&]role=/.test(requests[0].uri), requests[0].uri);
    assert.match(requests[0].uri, /insuranceRequestId=a(\+|%20)b%26role%3DADMIN/);
  });

  it("markCommentsAsRead sends only insuranceRequestId", async () => {
    await comments.markCommentsAsRead("claim-1");
    assert.equal(requests[0].url, "/comments/mark_read");
    assert.deepEqual(JSON.parse(requests[0].data), { insuranceRequestId: "claim-1" });
  });

  it("manager chat list uses hospitalId when given, otherwise type=HOSPITAL_NOTE", async () => {
    await comments.getlManagerComments("hosp-1");
    await comments.getlManagerComments();
    assert.deepEqual(requests[0].params, { hospitalId: "hosp-1" });
    assert.deepEqual(requests[1].params, { type: "HOSPITAL_NOTE" });
  });

  it("markRead encodes the hospital id in the path", async () => {
    await comments.markReadForAdminManagerComments("a/../b");
    assert.equal(requests[0].url, "/comments/markRead/a%2F..%2Fb");
  });
});

describe("dashboard service: hospitalUserId only when chosen", () => {
  const from = new Date("2026-01-01T00:00:00.000Z");
  const to = new Date("2026-01-31T00:00:00.000Z");

  for (const [label, value] of [["undefined", undefined], ["the default blank selection", " "], ["an empty string", ""]] as const) {
    it(`omits hospitalUserId for ${label}`, async () => {
      await getDashboardByDate(from, to, value);
      assert.ok(!("hospitalUserId" in requests[0].params));
      assert.ok(!requests[0].uri.includes("hospitalUserId"));
    });
  }

  it("sends hospitalUserId when an admin picks a hospital", async () => {
    await getDashboardByDate(from, to, "hosp-9");
    assert.equal(requests[0].params.hospitalUserId, "hosp-9");
  });

  it("still sends the date range (as ISO timestamps)", async () => {
    await getDashboardByDate(from, to);
    const query = new URLSearchParams(requests[0].uri.split("?")[1]);
    assert.equal(query.get("fromDate"), "2026-01-01T00:00:00.000Z");
    assert.equal(query.get("toDate"), "2026-01-31T00:00:00.000Z");
    assert.equal(new Date(query.get("fromDate")!).getTime(), from.getTime());
  });
});

describe("auth service: cookie flags and logout cleanup", () => {
  const loginResponse = { data: { access_token: "tok.en.sig", user: { id: "u1", name: "N", role: "HOSPITAL", hospitalName: "H" } } };

  it("sets auth cookies with SameSite=Lax and Secure on https", async () => {
    g.window.location.protocol = "https:";
    nextResponse = loginResponse;
    await auth.login({ email: "e", password: "p" });
    const tokenCookie = cookieWrites.find((c) => c.startsWith("access_token="))!;
    const roleCookie = cookieWrites.find((c) => c.startsWith("user_role="))!;
    for (const c of [tokenCookie, roleCookie]) {
      assert.match(c, /; sameSite=lax/i);
      assert.match(c, /; secure/i);
      assert.ok(!/expires=/i.test(c), "should stay a session cookie");
    }
  });

  it("omits Secure on plain http (local development)", async () => {
    g.window.location.protocol = "http:";
    nextResponse = loginResponse;
    await auth.login({ email: "e", password: "p" });
    const tokenCookie = cookieWrites.find((c) => c.startsWith("access_token="))!;
    assert.match(tokenCookie, /; sameSite=lax/i);
    assert.ok(!/; secure/i.test(tokenCookie));
  });

  it("logout clears runtime caches but keeps the precache", async () => {
    cacheNames = ["workbox-precache-v2-https://app/", "start-url", "static-image-assets", "others", "next-image"];
    deletedCaches.length = 0;
    auth.logout();
    await new Promise((r) => setTimeout(r, 0));
    assert.deepEqual(cacheNames, ["workbox-precache-v2-https://app/"]);
    assert.deepEqual(deletedCaches.sort(), ["next-image", "others", "start-url", "static-image-assets"]);
  });

  it("logout removes auth cookies and stored user details", async () => {
    store.set("userRole", "HOSPITAL");
    store.set("userId", "u1");
    cookieJar = { access_token: "t", user_role: "HOSPITAL" };
    auth.logout();
    assert.equal(store.get("userRole"), undefined);
    assert.equal(store.get("userId"), undefined);
    assert.deepEqual(cookieJar, {});
  });

  it("logout does not throw when Cache Storage is unavailable", () => {
    const saved = g.window.caches;
    delete g.window.caches;
    assert.doesNotThrow(() => auth.logout());
    g.window.caches = saved;
  });
});
