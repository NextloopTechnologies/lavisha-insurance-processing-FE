import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NEXT_STATUSES, STATUS_NAMES, statusChoices } from "@/lib/claimStatus";
import { StatusType } from "@/types/claims";

const names = (status: StatusType) => statusChoices(status).map((key) => STATUS_NAMES[key]);

describe("claim status flow (requirement #13)", () => {
  it("names follow the requirement document", () => {
    assert.equal(STATUS_NAMES.PENDING, "Pre-Auth Pending");
    assert.equal(STATUS_NAMES.ENHANCEMENT, "Enhancement");
    assert.equal(STATUS_NAMES.DISCHARGED, "Discharge Approved");
    assert.equal(STATUS_NAMES.SETTLEMENT_INITIATED, "Settlement Initiated");
  });

  it("every status has a name and a transition entry, and every target is a known status", () => {
    for (const key of Object.values(StatusType)) {
      assert.ok(STATUS_NAMES[key], `name for ${key}`);
      assert.ok(Array.isArray(NEXT_STATUSES[key]), `transitions for ${key}`);
      for (const to of NEXT_STATUSES[key]) assert.ok(STATUS_NAMES[to], `${key} -> ${to}`);
    }
  });

  it("offers the current status followed by its next steps", () => {
    assert.deepEqual(names(StatusType.PENDING), ["Pre-Auth Pending", "Pre-Auth Sent to TPA"]);
    assert.deepEqual(names(StatusType.SENT_TO_TPA), ["Pre-Auth Sent to TPA", "Pre-Auth Approved", "Query", "Pre-Auth Denied"]);
    assert.deepEqual(names(StatusType.QUERIED), ["Query", "Query Reply Sent"]);
    assert.deepEqual(names(StatusType.QUERY_REPLY_SENT), ["Query Reply Sent", "Pre-Auth Approved", "Query", "Pre-Auth Denied"]);
    assert.deepEqual(names(StatusType.DENIED), ["Pre-Auth Denied", "Pre-Auth Approved"]);
    assert.deepEqual(names(StatusType.ENHANCEMENT), ["Enhancement", "Pre-Auth Approved", "Query", "Pre-Auth Denied"]);
    assert.deepEqual(names(StatusType.APPROVED), ["Pre-Auth Approved", "Discharge Initiated", "Enhancement", "Query"]);
    assert.deepEqual(names(StatusType.DISCHARGE_INITIATED), ["Discharge Initiated", "Discharge Sent"]);
    assert.deepEqual(names(StatusType.DISCHARGED), ["Discharge Approved", "Settlement Initiated"]);
    assert.deepEqual(names(StatusType.SETTLED), ["Settled"]);
  });

  it("returns nothing for an unknown status", () => {
    assert.deepEqual(statusChoices("NOT_A_STATUS"), []);
  });
});
