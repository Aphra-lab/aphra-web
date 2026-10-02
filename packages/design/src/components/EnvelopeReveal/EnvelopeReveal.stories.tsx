import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { EnvelopeReveal } from './EnvelopeReveal';

const meta = {
  title: 'Compliance/EnvelopeReveal',
  component: EnvelopeReveal,
  parameters: { layout: 'fullscreen' },
  args: { onDone: fn() },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnvelopeReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
