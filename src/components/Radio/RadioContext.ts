import { createContext, useContext } from "react";

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export const useRadioGroup = () => useContext(RadioGroupContext);
