import React from "react";

const groups: Record<string, string[]> = {
  Surfaces: ["surface-0", "surface-1", "surface-2", "surface-3", "rim-default", "rim-strong"],
  Foreground: ["fg-default", "fg-muted", "fg-subtle"],
  Accent: ["accent-default", "accent-pressed", "accent-on", "accent-tonal", "accent-tonal-pressed", "accent-on-tonal"],
  Status: ["positive-default", "positive-tonal", "warning-default", "warning-tonal", "danger-default", "danger-tonal"],
  Glass: ["glass-fill", "glass-fill-pressed", "glass-rim", "glass-accent", "glass-tonal", "glass-danger", "glass-highlight"],
  "Focus & disabled": ["focus-ring", "focus-glow", "disabled-fill", "disabled-fg", "disabled-rim", "disabled-glass"],
};

const radii = ["sm", "md", "lg", "xl", "full"];

const label: React.CSSProperties = {
  fontFamily: "var(--sf-font-mono)",
  fontSize: "0.6875rem",
  color: "var(--sf-fg-muted)",
};

export const TokenGrid = () => (
  <div className="sf-root" style={{ padding: "1.5rem", borderRadius: "1.25rem", display: "grid", gap: "1.5rem" }}>
    {Object.entries(groups).map(([group, tokens]) => (
      <section key={group}>
        <div style={{ ...label, textTransform: "uppercase", marginBottom: "0.5rem" }}>{group}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))", gap: "0.75rem" }}>
          {tokens.map((t) => (
            <div key={t}>
              <div
                style={{
                  height: "2.75rem",
                  borderRadius: "var(--sf-radius-md)",
                  background: `var(--sf-${t})`,
                  border: "1px solid var(--sf-rim-default)",
                }}
              />
              <div style={{ ...label, color: "var(--sf-fg-default)", marginTop: "0.375rem" }}>--sf-{t}</div>
            </div>
          ))}
        </div>
      </section>
    ))}
    <section>
      <div style={{ ...label, textTransform: "uppercase", marginBottom: "0.5rem" }}>Radius</div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {radii.map((r) => (
          <div key={r}>
            <div
              style={{
                width: "6rem",
                height: "2.75rem",
                borderRadius: `var(--sf-radius-${r})`,
                background: "var(--sf-surface-2)",
                border: "1px solid var(--sf-rim-strong)",
              }}
            />
            <div style={{ ...label, marginTop: "0.375rem" }}>--sf-radius-{r}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
);
