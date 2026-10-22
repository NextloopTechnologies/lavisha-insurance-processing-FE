import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { singleActionRow } from "@/lib/rowAction";

// minimal stand-ins for the row and the clicked element
const target = (interactive = false) => ({ closest: (selector: string) => (interactive && selector.includes("button") ? {} : null) });
const row = (contains = true) => ({ contains: () => contains });
const click = (props: any, t = target(), r = row()) => props.onClick({ target: t, currentTarget: r });

let selection = "";
beforeEach(() => {
  selection = "";
  (globalThis as any).window = { getSelection: () => ({ toString: () => selection }) };
});

describe("singleActionRow", () => {
  it("leaves rows without a single action untouched", () => {
    assert.deepEqual(singleActionRow(null, "hover:bg-gray-50"), { className: "hover:bg-gray-50" });
    assert.deepEqual(singleActionRow(undefined), { className: "" });
  });

  it("runs the action on a plain click and marks the row clickable", () => {
    let runs = 0;
    const props = singleActionRow(() => runs++, "hover:bg-gray-50");
    assert.equal(props.className, "hover:bg-gray-50 cursor-pointer");
    click(props);
    assert.equal(runs, 1);
  });

  it("ignores clicks on buttons/links/inputs, inside portals, and while selecting text", () => {
    let runs = 0;
    const props = singleActionRow(() => runs++);
    click(props, target(true)); // a button in the row keeps its own behaviour
    click(props, target(), row(false)); // e.g. a dialog opened from the row
    selection = "CLM-00010";
    click(props);
    assert.equal(runs, 0);
  });
});
