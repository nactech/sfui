import { Segmented, SelectField, Slider, Switch, TextField } from "@nactech/sfui";
import type { ControlDef, ControlValues } from "@site/content/types";
import styles from "./ui.module.scss";

/** Default values of a controls definition. */
export function defaultValues(controls: ControlDef[] = []): ControlValues {
  return Object.fromEntries(controls.map((c) => [c.name, c.default]));
}

const labelOf = (control: ControlDef) => control.label ?? control.name[0].toUpperCase() + control.name.slice(1);

/** Short enums become a Segmented, longer ones a SelectField. */
const fitsSegmented = (options: readonly string[]) => options.length <= 3 || options.join("").length <= 18;

export interface ControlsPanelProps {
  controls: ControlDef[];
  values: ControlValues;
  onChange: (name: string, value: ControlValues[string]) => void;
}

/** The props panel next to a live demo, built from the library's own inputs. */
export function ControlsPanel({ controls, values, onChange }: ControlsPanelProps) {
  return (
    <div className={styles.controls} role="group" aria-label="Demo controls">
      {controls.map((control) => {
        const label = labelOf(control);
        switch (control.type) {
          case "enum":
            return fitsSegmented(control.options) ? (
              <div key={control.name} className={styles.control}>
                <span className={styles.controlLabel} id={`ctl-${control.name}`}>
                  {label}
                </span>
                <Segmented
                  size="s"
                  aria-labelledby={`ctl-${control.name}`}
                  options={control.options.map((o) => ({ value: o, label: o }))}
                  value={String(values[control.name])}
                  onValueChange={(v) => onChange(control.name, v)}
                />
              </div>
            ) : (
              <div key={control.name} className={styles.control}>
                <SelectField
                  label={label}
                  options={control.options.map((o) => ({ value: o, label: o }))}
                  value={String(values[control.name])}
                  onValueChange={(v) => onChange(control.name, v)}
                />
              </div>
            );
          case "boolean":
            return (
              <div key={control.name} className={styles.controlRow}>
                <Switch
                  label={label}
                  checked={Boolean(values[control.name])}
                  onCheckedChange={(v) => onChange(control.name, v)}
                />
              </div>
            );
          case "text":
            return (
              <div key={control.name} className={styles.control}>
                <TextField
                  label={label}
                  value={String(values[control.name])}
                  onValueChange={(v) => onChange(control.name, v)}
                />
              </div>
            );
          case "number":
            return (
              <div key={control.name} className={styles.control}>
                <span className={styles.controlLabel}>{label}</span>
                <Slider
                  size="s"
                  platform="web"
                  label={label}
                  min={control.min}
                  max={control.max}
                  step={control.step ?? 1}
                  value={Number(values[control.name])}
                  onValueChange={(v) => onChange(control.name, v)}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
