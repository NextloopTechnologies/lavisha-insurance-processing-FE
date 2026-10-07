"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Download, Loader2, Scan, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDownloadUrl } from "@/services/files";
import { displayNameFromKey, isLocalUrl } from "@/lib/fileNames";
import {
  BUTTON_ZOOM_STEP,
  centredState,
  constrainPan,
  distance,
  fitScale,
  fittedState,
  midpoint,
  scaleLimits,
  viewportCentre,
  wheelZoomFactor,
  zoomAt,
  zoomPercent,
  type Point,
  type Size,
  type ViewState,
} from "@/lib/imageViewer";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** presigned URL of a stored document, or a local File picked but not yet saved */
  file?: File | null | string;
  /** stored file key (e.g. claims/scan_<uuid>.webp); used for the title and for downloading */
  documentName?: string;
}

const KEYBOARD_PAN_STEP = 60;

/** A string URL as-is, or a temporary object URL for a local File (revoked on change/unmount). */
function usePreviewSrc(file: FilePreviewModalProps["file"]) {
  const [src, setSrc] = useState<string | undefined>(typeof file === "string" ? file : undefined);
  useEffect(() => {
    if (typeof File !== "undefined" && file instanceof File) {
      const url = URL.createObjectURL(file);
      setSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    setSrc(typeof file === "string" ? file : undefined);
  }, [file]);
  return src;
}

function triggerDownload(href: string, fileName?: string) {
  const link = document.createElement("a");
  link.href = href;
  if (fileName) link.download = fileName; // honoured for blob:/data:; remote links rely on the server's Content-Disposition
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ImagePreview({ open, onClose, file, documentName }: FilePreviewModalProps) {
  const src = usePreviewSrc(file);
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [natural, setNatural] = useState<Size | null>(null);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // latest geometry for event handlers registered once
  const geometry = useRef<{ viewport: Size; natural: Size | null }>({ viewport, natural });
  useEffect(() => {
    geometry.current = { viewport, natural };
  }, [viewport, natural]);

  // until the user zooms or pans, the image re-fits when the window resizes
  const userAdjusted = useRef(false);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ point?: Point; pinchDistance?: number; pinchMid?: Point }>({});

  const displayName =
    displayNameFromKey(documentName) || (typeof file === "object" && file?.name) || "Uploaded document";

  /** Applies a view change computed from the current geometry; no-op until the image has loaded. */
  const update = useCallback((next: (current: ViewState, vp: Size, img: Size) => ViewState, byUser = true) => {
    const { viewport: vp, natural: img } = geometry.current;
    if (!img || !vp.width || !vp.height) return;
    if (byUser) userAdjusted.current = true;
    setView((current) => next(current, vp, img));
  }, []);

  // new image: start over
  useEffect(() => {
    setNatural(null);
    setStatus("loading");
    userAdjusted.current = false;
  }, [src]);

  // track the viewport size
  useEffect(() => {
    if (!viewportEl) return;
    const measure = () => setViewport({ width: viewportEl.clientWidth, height: viewportEl.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportEl);
    return () => observer.disconnect();
  }, [viewportEl]);

  // fit on load and on resize (unless the user has zoomed), otherwise keep the image in bounds
  useEffect(() => {
    if (!natural || !viewport.width || !viewport.height) return;
    setView((current) =>
      userAdjusted.current ? constrainPan(current, viewport, natural) : fittedState(viewport, natural),
    );
  }, [natural, viewport]);

  // wheel / trackpad zoom around the cursor; registered natively so the page does not scroll
  useEffect(() => {
    if (!viewportEl) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = viewportEl.getBoundingClientRect();
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = wheelZoomFactor(event.deltaY, event.deltaMode, event.ctrlKey, rect.height);
      update((current, vp, img) => zoomAt(current, current.scale * factor, anchor, vp, img));
    };
    viewportEl.addEventListener("wheel", onWheel, { passive: false });
    return () => viewportEl.removeEventListener("wheel", onWheel);
  }, [viewportEl, update]);

  const localPoint = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startGesture = () => {
    const points = [...pointers.current.values()];
    gesture.current =
      points.length >= 2
        ? { pinchDistance: distance(points[0], points[1]), pinchMid: midpoint(points[0], points[1]) }
        : { point: points[0] };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (status !== "ready" || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, localPoint(event));
    startGesture();
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, localPoint(event));
    const points = [...pointers.current.values()];
    const g = gesture.current;

    if (points.length >= 2 && g.pinchDistance && g.pinchMid) {
      // pinch: zoom around the fingers' midpoint and follow the midpoint as it moves
      const mid = midpoint(points[0], points[1]);
      const ratio = distance(points[0], points[1]) / g.pinchDistance;
      const previousMid = g.pinchMid;
      update((current, vp, img) => {
        const zoomed = zoomAt(current, current.scale * ratio, previousMid, vp, img);
        return constrainPan(
          { ...zoomed, x: zoomed.x + mid.x - previousMid.x, y: zoomed.y + mid.y - previousMid.y },
          vp,
          img,
        );
      });
      gesture.current = { pinchDistance: distance(points[0], points[1]), pinchMid: mid };
    } else if (points.length === 1 && g.point) {
      const [point] = points;
      const dx = point.x - g.point.x;
      const dy = point.y - g.point.y;
      update((current, vp, img) => constrainPan({ ...current, x: current.x + dx, y: current.y + dy }, vp, img));
      gesture.current = { point };
    }
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    startGesture(); // pinch -> one finger continues as a drag without jumping
    if (pointers.current.size === 0) setDragging(false);
  };

  const onDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    update((current, vp, img) => {
      const fit = fitScale(vp, img);
      const atFit = Math.abs(current.scale - fit) < 0.01;
      if (!atFit) {
        userAdjusted.current = false;
        return fittedState(vp, img);
      }
      return zoomAt(current, Math.max(1, fit * 2), anchor, vp, img);
    });
  };

  const zoomBy = (factor: number) =>
    update((current, vp, img) => zoomAt(current, current.scale * factor, viewportCentre(vp), vp, img));
  const fitToScreen = () =>
    update((_current, vp, img) => {
      userAdjusted.current = false;
      return fittedState(vp, img);
    }, false);
  const actualSize = () => update((_current, vp, img) => centredState(1, vp, img));
  const panBy = (dx: number, dy: number) =>
    update((current, vp, img) => constrainPan({ ...current, x: current.x + dx, y: current.y + dy }, vp, img));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const actions: Record<string, () => void> = {
      "+": () => zoomBy(BUTTON_ZOOM_STEP),
      "=": () => zoomBy(BUTTON_ZOOM_STEP),
      "-": () => zoomBy(1 / BUTTON_ZOOM_STEP),
      _: () => zoomBy(1 / BUTTON_ZOOM_STEP),
      "0": fitToScreen,
      "1": actualSize,
      ArrowLeft: () => panBy(KEYBOARD_PAN_STEP, 0),
      ArrowRight: () => panBy(-KEYBOARD_PAN_STEP, 0),
      ArrowUp: () => panBy(0, KEYBOARD_PAN_STEP),
      ArrowDown: () => panBy(0, -KEYBOARD_PAN_STEP),
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const handleDownload = async () => {
    if (!src) return;
    if (isLocalUrl(src)) {
      // not uploaded yet: save the picked file itself, under its own name
      const localName = typeof File !== "undefined" && file instanceof File ? file.name : displayName;
      triggerDownload(src, localName);
      return;
    }
    if (!documentName) {
      toast.error("This file can't be downloaded");
      return;
    }
    setDownloading(true);
    try {
      const { data } = await getDownloadUrl(documentName);
      triggerDownload(data.url);
    } catch (error: any) {
      toast.error(
        error?.response?.status === 404 ? "This file is no longer available" : "Download failed, please try again",
      );
    } finally {
      setDownloading(false);
    }
  };

  const limits = natural ? scaleLimits(viewport, natural) : { min: 1, max: 1 };
  const ready = status === "ready" && !!natural;
  const canPan = ready && (natural.width * view.scale > viewport.width + 0.5 || natural.height * view.scale > viewport.height + 0.5);
  const toolbarButton =
    "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] gap-3 p-4 sm:max-w-5xl" onKeyDown={onKeyDown}>
        <DialogHeader className="pr-8">
          <DialogTitle className="flex min-w-0 items-center gap-3">
            <span>Preview</span>
            <span className="truncate text-sm font-normal text-gray-500" title={displayName}>
              {displayName}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Scroll or pinch to zoom, drag to move, double-click to zoom in or back to fit. Keys: plus, minus, 0 to fit, 1 for actual size.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Image controls">
          <button type="button" className={toolbarButton} onClick={() => zoomBy(1 / BUTTON_ZOOM_STEP)}
            disabled={!ready || view.scale <= limits.min + 1e-6} aria-label="Zoom out" title="Zoom out (-)">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-14 text-center text-sm tabular-nums text-gray-700" aria-live="polite" data-testid="zoom-level">
            {ready ? zoomPercent(view.scale) : "–"}
          </span>
          <button type="button" className={toolbarButton} onClick={() => zoomBy(BUTTON_ZOOM_STEP)}
            disabled={!ready || view.scale >= limits.max - 1e-6} aria-label="Zoom in" title="Zoom in (+)">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButton} onClick={fitToScreen} disabled={!ready}
            aria-label="Fit to screen" title="Fit to screen (0)">
            <Scan className="h-4 w-4" />
            <span>Fit</span>
          </button>
          <button type="button" className={toolbarButton} onClick={actualSize} disabled={!ready}
            aria-label="Actual size" title="Actual size, 100% (1)">
            <span>100%</span>
          </button>
          <button type="button" className={`${toolbarButton} ml-auto`} onClick={handleDownload}
            disabled={!src || downloading} aria-label="Download" title="Download">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        <div
          ref={setViewportEl}
          className={`relative h-[70vh] touch-none select-none overflow-hidden rounded-md bg-gray-100 outline-none ${
            canPan ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onDoubleClick={onDoubleClick}
          data-testid="image-viewport"
        >
          {open && src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={displayName}
              draggable={false}
              onLoad={(event) => {
                const img = event.currentTarget;
                setNatural({ width: img.naturalWidth, height: img.naturalHeight });
                setStatus("ready");
              }}
              onError={() => setStatus("error")}
              className="absolute left-0 top-0 max-w-none"
              style={{
                width: natural?.width,
                height: natural?.height,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "0 0",
                visibility: ready ? "visible" : "hidden",
                willChange: "transform",
              }}
              data-testid="preview-image"
            />
          )}
          {status === "loading" && src && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
              The image could not be loaded. Try downloading it instead.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
