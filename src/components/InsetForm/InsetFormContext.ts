import { createContext, useContext } from "react";

export interface InsetFormContextValue {
  /** Disables every row in the group (a row's own `disabled` still wins when set). */
  disabled: boolean;
}

export const InsetFormContext = createContext<InsetFormContextValue>({ disabled: false });

export function useRowDisabled(own: boolean | undefined): boolean {
  const ctx = useContext(InsetFormContext);
  return own ?? ctx.disabled;
}
