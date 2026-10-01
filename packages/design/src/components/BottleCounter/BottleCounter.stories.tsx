import type { Meta, StoryObj } from '@storybook/react-vite';

import { BottleCounter } from './BottleCounter';

const meta = {
  title: 'Primitives/BottleCounter',
  component: BottleCounter,
} satisfies Meta<typeof BottleCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sold: Story = { args: { value: 450 } };
export const Loading: Story = { args: { value: undefined } };
export const Large: Story = { args: { value: 1234567 } };
