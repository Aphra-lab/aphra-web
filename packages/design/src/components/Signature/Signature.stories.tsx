import type { Meta, StoryObj } from '@storybook/react-vite';

import { Signature } from './Signature';

const meta = {
  title: 'Primitives/Signature',
  component: Signature,
} satisfies Meta<typeof Signature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTeam: Story = { args: { team: true } };
