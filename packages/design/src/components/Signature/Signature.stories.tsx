import type { Meta, StoryObj } from '@storybook/react-vite';

import { Signature } from './Signature';

const meta = {
  title: 'Primitives/Signature',
  component: Signature,
  parameters: {
    docs: {
      description: {
        component:
          "`signature.svg` is a placeholder drawn with a system script font. The designer's outlined Magnolia signature replaces it (spec section 13, input 1).",
      },
    },
  },
} satisfies Meta<typeof Signature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTeam: Story = { args: { team: true } };
