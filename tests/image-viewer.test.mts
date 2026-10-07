import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_SCALE,
  centredState,
  constrainPan,
  fitScale,
  fittedState,
  scaleLimits,
  wheelZoomFactor,
  zoomAt,
  zoomPercent,
  type ViewState,
} from "@/lib/imageViewer";
import { displayNameFromKey, isLocalUrl } from "@/lib/fileNames";

const viewport = { width: 1000, height: 600 };
const photo = { width: 4000, height: 3000 }; // larger than the viewport
const icon = { width: 200, height: 100 }; // smaller than the viewport
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

// image pixel under a viewport point
const imagePointAt = (s: ViewState, p: { x: number; y: number }) => ({ x: (p.x - s.x) / s.scale, y: (p.y - s.y) / s.scale });

describe("fit and limits", () => {
  it("fits a large image by its tighter side", () => {
    assert.equal(fitScale(viewport, photo), 0.2); // 600 / 3000
  });

  it("never upscales a small image to fit", () => {
    assert.equal(fitScale(viewport, icon), 1);
  });

  it("allows zooming out to half the fit size and in to 800%", () => {
    assert.deepEqual(scaleLimits(viewport, photo), { min: 0.1, max: MAX_SCALE });
  });

  it("is safe before the image or viewport has a size", () => {
    assert.equal(fitScale({ width: 0, height: 0 }, photo), 1);
    assert.equal(fitScale(viewport, { width: 0, height: 0 }), 1);
  });

  it("centres the fitted image", () => {
    const s = fittedState(viewport, photo); // drawn 800 x 600
    assert.deepEqual(s, { scale: 0.2, x: 100, y: 0 });
  });
});

describe("zoomAt keeps the pixel under the cursor fixed", () => {
  const start = fittedState(viewport, photo);

  for (const anchor of [{ x: 300, y: 200 }, { x: 500, y: 300 }, { x: 750, y: 450 }]) {
    it(`anchor ${anchor.x},${anchor.y}`, () => {
      const before = imagePointAt(start, anchor);
      const zoomed = zoomAt(start, 1, anchor, viewport, photo);
      assert.equal(zoomed.scale, 1);
      const after = imagePointAt(zoomed, anchor);
      close(after.x, before.x);
      close(after.y, before.y);
    });
  }

  it("near the image corner, slides the image flush with the viewport instead of leaving a gap", () => {
    const anchor = { x: 899, y: 599 };
    const zoomed = zoomAt(start, 1, anchor, viewport, photo);
    // horizontally the anchored zoom would open a 96px gap on the right, so the right edge is held flush
    assert.equal(zoomed.x + photo.width * zoomed.scale, viewport.width);
    // vertically there is no gap to close, so the pixel under the cursor stays put
    close(imagePointAt(zoomed, anchor).y, imagePointAt(start, anchor).y);
  });

  it("is reversible: zoom in then out at the same point returns to the start", () => {
    const anchor = { x: 420, y: 250 };
    const zoomedIn = zoomAt(start, 0.8, anchor, viewport, photo);
    const back = zoomAt(zoomedIn, 0.2, anchor, viewport, photo);
    close(back.scale, start.scale);
    close(back.x, start.x);
    close(back.y, start.y);
  });

  it("clamps to the limits", () => {
    assert.equal(zoomAt(start, 100, { x: 0, y: 0 }, viewport, photo).scale, MAX_SCALE);
    assert.equal(zoomAt(start, 0.0001, { x: 0, y: 0 }, viewport, photo).scale, 0.1);
  });
});

describe("constrainPan", () => {
  it("centres an axis where the image is smaller than the viewport", () => {
    const s = constrainPan({ scale: 1, x: -999, y: 999 }, viewport, icon);
    assert.deepEqual(s, { scale: 1, x: 400, y: 250 });
  });

  it("stops the image edges at the viewport edges when it is larger", () => {
    // drawn 4000 x 3000 at 100%
    assert.deepEqual(constrainPan({ scale: 1, x: 50, y: 50 }, viewport, photo), { scale: 1, x: 0, y: 0 });
    assert.deepEqual(constrainPan({ scale: 1, x: -5000, y: -5000 }, viewport, photo), { scale: 1, x: -3000, y: -2400 });
    assert.deepEqual(constrainPan({ scale: 1, x: -1234, y: -567 }, viewport, photo), { scale: 1, x: -1234, y: -567 });
  });
});

describe("actual size", () => {
  it("shows the image at 100% centred, clamped to the image edges", () => {
    assert.deepEqual(centredState(1, viewport, photo), { scale: 1, x: -1500, y: -1200 });
    assert.deepEqual(centredState(1, viewport, icon), { scale: 1, x: 400, y: 250 });
  });
});

describe("wheel zoom", () => {
  it("scroll up zooms in, scroll down zooms out, symmetrically", () => {
    const zoomIn = wheelZoomFactor(-100, 0, false);
    const zoomOut = wheelZoomFactor(100, 0, false);
    assert.ok(zoomIn > 1 && zoomOut < 1);
    close(zoomIn * zoomOut, 1);
  });

  it("treats line-mode deltas (Firefox mouse wheels) as 16px lines", () => {
    close(wheelZoomFactor(3, 1, false), wheelZoomFactor(48, 0, false));
  });

  it("zooms faster per pixel for a trackpad pinch (ctrlKey)", () => {
    assert.ok(wheelZoomFactor(-10, 0, true) > wheelZoomFactor(-10, 0, false));
  });

  it("caps a single huge wheel event", () => {
    close(wheelZoomFactor(-100000, 0, false), wheelZoomFactor(-200, 0, false));
  });
});

describe("labels and names", () => {
  it("formats the zoom percent against actual pixels", () => {
    assert.equal(zoomPercent(0.2), "20%");
    assert.equal(zoomPercent(1), "100%");
    assert.equal(zoomPercent(1.25 ** 3), "195%");
  });

  it("matches the backend's download name", () => {
    assert.equal(displayNameFromKey("claims/scan_674b86d2-4255-458a-aa7b-8e5d40ce9627.webp"), "scan.webp");
    assert.equal(displayNameFromKey("claims/legacy-name.pdf"), "legacy-name.pdf");
    assert.equal(displayNameFromKey("claims/_0aa1b2c3-1111-4222-8333-944455556666.png"), "document.png");
    assert.equal(displayNameFromKey(undefined), "");
  });

  it("recognises local URLs", () => {
    assert.equal(isLocalUrl("blob:http://localhost:3000/abc"), true);
    assert.equal(isLocalUrl("data:image/png;base64,AAAA"), true);
    assert.equal(isLocalUrl("https://bucket.s3.amazonaws.com/claims/x.webp?X-Amz-Signature=1"), false);
    assert.equal(isLocalUrl(undefined), false);
  });
});
