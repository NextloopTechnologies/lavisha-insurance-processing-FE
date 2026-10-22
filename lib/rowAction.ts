import type { MouseEvent } from "react";

// Clicks on these keep their own behaviour (buttons, links, dropdowns, inputs in the row).
const INTERACTIVE = "a,button,input,select,textarea,label,[role=button],[role=combobox],[role=option],[role=menuitem],[role=checkbox]";

/**
 * Props that make a table row run its only action when clicked anywhere on the row.
 * Pass `null` when the row has zero or several actions (or only a destructive one) —
 * the row then stays a plain row.
 */
export function singleActionRow(action: (() => void) | null | undefined, className = "") {
  if (!action) return { className };
  return {
    className: `${className} cursor-pointer`.trim(),
    onClick: (event: MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement;
      // clicks inside portals (dialogs, dropdown menus opened from the row) bubble through React too
      if (!event.currentTarget.contains(target)) return;
      if (target.closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return; // the user is selecting text
      action();
    },
  };
}
