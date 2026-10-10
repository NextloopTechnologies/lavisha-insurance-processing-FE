// Pure geometry for the image preview's zoom and pan.
// The image is drawn at its natural pixel size with `translate(x, y) scale(scale)`
// and transform-origin 0 0, so a screen point p maps to image pixel (p - x) / scale.
// scale 1 means one image pixel per CSS pixel, which is what the "100%" label means.

export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type ViewState = { scale: number; x: number; y: number };

export const MAX_SCALE = 8; // 800% of actual size
export const BUTTON_ZOOM_STEP = 1.25;

/** Largest scale that shows the whole image inside the viewport, never upscaling. */
export function fitScale(viewport: Size, image: Size): number {
  if (!viewport.width || !viewport.height || !image.width || !image.height) return 1;
  return Math.min(viewport.width / image.width, viewport.height / image.height, 1);
}

export function scaleLimits(viewport: Size, image: Size): { min: number; max: number } {
  const fit = fitScale(viewport, image);
  return { min: fit / 2, max: Math.max(MAX_SCALE, fit) };
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Keeps the image in view: on an axis where it is smaller than the viewport it is
 * centred; where it is larger, its edges cannot be dragged past the viewport edges.
 */
export function constrainPan(state: ViewState, viewport: Size, image: Size): ViewState {
  const axis = (offset: number, viewportLength: number, imageLength: number) => {
    const drawn = imageLength * state.scale;
    if (drawn <= viewportLength) return (viewportLength - drawn) / 2;
    return clamp(offset, viewportLength - drawn, 0);
  };
  return {
    scale: state.scale,
    x: axis(state.x, viewport.width, image.width),
    y: axis(state.y, viewport.height, image.height),
  };
}

/** Whole image centred at the fit scale. */
export function fittedState(viewport: Size, image: Size): ViewState {
  return constrainPan({ scale: fitScale(viewport, image), x: 0, y: 0 }, viewport, image);
}

/** Image centred at a given scale (e.g. 1 for "actual size"). */
export function centredState(scale: number, viewport: Size, image: Size): ViewState {
  const { min, max } = scaleLimits(viewport, image);
  const s = clamp(scale, min, max);
  return constrainPan(
    { scale: s, x: (viewport.width - image.width * s) / 2, y: (viewport.height - image.height * s) / 2 },
    viewport,
    image,
  );
}

/**
 * Zooms to `targetScale` so the image pixel under `anchor` (a viewport point)
 * stays under it, as wheel, pinch and double-click zoom should.
 */
export function zoomAt(state: ViewState, targetScale: number, anchor: Point, viewport: Size, image: Size): ViewState {
  const { min, max } = scaleLimits(viewport, image);
  const scale = clamp(targetScale, min, max);
  const ratio = scale / state.scale;
  return constrainPan(
    { scale, x: anchor.x - (anchor.x - state.x) * ratio, y: anchor.y - (anchor.y - state.y) * ratio },
    viewport,
    image,
  );
}

export const viewportCentre = (viewport: Size): Point => ({ x: viewport.width / 2, y: viewport.height / 2 });

/**
 * Multiplicative zoom factor for a wheel event. Mouse wheels and trackpads report
 * very different deltas, so the delta is normalised to pixels first; trackpad pinch
 * arrives as a wheel event with ctrlKey set and small deltas, so it zooms faster per pixel.
 */
export function wheelZoomFactor(deltaY: number, deltaMode: number, ctrlKey: boolean, pageHeight = 800): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * pageHeight : deltaY;
  const perPixel = ctrlKey ? 0.01 : 0.0015;
  return Math.exp(-clamp(pixels, -200, 200) * perPixel);
}

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Percent label, relative to the image's actual pixel size. */
export const zoomPercent = (scale: number) => `${Math.round(scale * 100)}%`;
