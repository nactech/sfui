import type { Meta, StoryObj } from "@storybook/react-vite";
import Stack from "./Stack";
import Container from "../Container";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  args: { spacing: 3, direction: "row", children: null },
} satisfies Meta<typeof Stack>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: (args) => (
    <Stack {...args}>
      {["One", "Two", "Three"].map((t) => (
        <Container key={t} variant="surface-2" outline>
          {t}
        </Container>
      ))}
    </Stack>
  ),
};
