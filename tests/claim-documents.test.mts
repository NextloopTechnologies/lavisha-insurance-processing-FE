import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLAIM_DOC_TYPES,
  PLACEHOLDER_REMARK,
  appendUploads,
  asArray,
  collectDocuments,
  groupDocuments,
  hasMissingRemarks,
  removeFromSlot,
  setRemark,
} from "@/lib/claimDocuments";

const saved = [
  { id: "1", fileName: "claims/icp-a.pdf", type: "ICP", url: "https://s3/icp-a" },
  { id: "2", fileName: "claims/icp-b.pdf", type: "ICP", url: "https://s3/icp-b" },
  { id: "3", fileName: "claims/misc.pdf", type: "OTHER", remark: "OT notes", url: "https://s3/misc" },
  { id: "4", fileName: "claims/settle.pdf", type: "SETTLEMENT_LETTER" },
];

describe("claim documents", () => {
  it("asArray normalises legacy single values and empty strings", () => {
    assert.deepEqual(asArray(""), []);
    assert.deepEqual(asArray(undefined), []);
    assert.deepEqual(asArray({ id: "1" }), [{ id: "1" }]);
    assert.deepEqual(asArray([{ id: "1" }]), [{ id: "1" }]);
  });

  it("groups every slot as a list, keeps several files per type, ignores other types", () => {
    const grouped = groupDocuments(saved, CLAIM_DOC_TYPES);
    assert.equal(grouped.ICP.length, 2);
    assert.deepEqual(grouped.PRE_AUTH, []);
    assert.equal(grouped.OTHER[0].remark, "OT notes");
    assert.equal("remark" in grouped.ICP[0], false);
    assert.equal("SETTLEMENT_LETTER" in grouped, false);
  });

  it("appends a multi-file upload in order and only gives remark slots a placeholder note", () => {
    const files = [new File(["a"], "p1.pdf"), new File(["b"], "p2.pdf")];
    let inputs: any = { ICP: [] };
    inputs = appendUploads(inputs, "ICP", [{ key: "claims/p1.pdf" }, { key: "claims/p2.pdf" }], files);
    assert.deepEqual(inputs.ICP.map((d: any) => d.fileName), ["claims/p1.pdf", "claims/p2.pdf"]);
    assert.equal(inputs.ICP[0].file, files[0]);
    assert.equal(inputs.ICP[0].remark, undefined);

    inputs = appendUploads(inputs, "OTHER", [{ key: "claims/m.pdf" }], [files[0]]);
    assert.equal(inputs.OTHER[0].remark, PLACEHOLDER_REMARK);
  });

  it("collects API documents without local-only fields, optionally only new uploads", () => {
    const inputs = {
      ICP: [{ id: "1", fileName: "claims/old.pdf", type: "ICP", url: "u" }, { fileName: "claims/new.pdf", type: "ICP", isNew: true, file: {} }],
      OTHER: "",
    };
    assert.deepEqual(collectDocuments(inputs, CLAIM_DOC_TYPES), [
      { id: "1", fileName: "claims/old.pdf", type: "ICP" },
      { fileName: "claims/new.pdf", type: "ICP" },
    ]);
    assert.deepEqual(collectDocuments(inputs, CLAIM_DOC_TYPES, { onlyNew: true }), [{ fileName: "claims/new.pdf", type: "ICP" }]);
  });

  it("removes one file by id, or by key when it has not been saved yet", () => {
    const inputs = {
      ICP: [{ id: "1", fileName: "claims/a.pdf", type: "ICP" }, { fileName: "claims/b.pdf", type: "ICP" }],
    };
    assert.deepEqual(removeFromSlot(inputs, { id: "1", fileName: "claims/a.pdf", type: "ICP" }).ICP, [inputs.ICP[1]]);
    assert.deepEqual(removeFromSlot(inputs, { fileName: "claims/b.pdf", type: "ICP" }).ICP, [inputs.ICP[0]]);
  });

  it("requires real notes only on remark slots", () => {
    const inputs: any = { ICP: [{ fileName: "x", type: "ICP" }], OTHER: [{ fileName: "m", type: "OTHER", remark: PLACEHOLDER_REMARK }] };
    assert.equal(hasMissingRemarks(inputs, CLAIM_DOC_TYPES), true);
    assert.equal(hasMissingRemarks(setRemark(inputs, "OTHER", "m", "Final bill"), CLAIM_DOC_TYPES), false);
    assert.equal(hasMissingRemarks({ ICP: inputs.ICP }, CLAIM_DOC_TYPES), false);
  });
});
