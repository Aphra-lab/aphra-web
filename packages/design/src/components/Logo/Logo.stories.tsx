import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo';

const meta = {
  title: 'Primitives/Logo',
  component: Logo,
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wordmark: Story = { args: { variant: 'wordmark' } };
export const WordmarkWithMoon: Story = { args: { variant: 'wordmark-moon' } };
export const OnBlack: Story = {
  args: { variant: 'wordmark-moon', className: 'h-16 text-paper' },
  decorators: [
    (Story) => (
      <div className="bg-black p-8">
        <Story />
      </div>
    ),
  ],
};
