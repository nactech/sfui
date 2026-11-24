import { createContext, useContext } from "react";

/** final.pen → L/A Segmented (mail feeds), L/B Flat on canvas (content/media), L/C Inset group (settings). */
export type ListVariant = "segmented" | "flat" | "inset";

export interface ListContextValue {
  variant: ListVariant;
  /** Edit mode: leading selection circles, chevrons hidden, swipe disabled. */
  selectable: boolean;
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  /** Id of the row whose swipe actions are open (only one at a time per list). */
  openSwipe: string | null;
  setOpenSwipe: (id: string | null) => void;
}

const noop = () => {};

export const ListContext = createContext<ListContextValue>({
  variant: "inset",
  selectable: false,
  isSelected: () => false,
  toggle: noop,
  openSwipe: null,
  setOpenSwipe: noop,
});

export const useListContext = () => useContext(ListContext);
