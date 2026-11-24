import type { Meta, StoryObj } from "@storybook/react-vite";
import Container from "./Container";

const meta = {
  title: "Layout/Container",
  component: Container,
  args: { variant: "surface-1", outline: true, shapeStyle: "lg", padding: 4, children: "Surface" },
} satisfies Meta<typeof Container>;
export default meta;

export const Default: StoryObj<typeof meta> = {};

export const Elevation: StoryObj<typeof meta> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {(["surface-0", "surface-1", "surface-2", "surface-3", "tonal", "glass"] as const).map((v) => (
        <Container key={v} variant={v} outline>
          {v}
        </Container>
      ))}
    </div>
  ),
};
