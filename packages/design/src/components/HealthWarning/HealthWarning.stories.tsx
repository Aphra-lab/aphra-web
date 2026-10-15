import type { Meta, StoryObj } from '@storybook/react-vite';

import { HealthWarning } from './HealthWarning';

const meta = {
  title: 'Compliance/HealthWarning',
  component: HealthWarning,
} satisfies Meta<typeof HealthWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnPaper: Story = {};
export const OnBlack: Story = {
  args: { tone: 'black' },
  decorators: [
    (Story) => (
      <div className="bg-black p-8">
        <Story />
      </div>
    ),
  ],
};
