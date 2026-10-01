import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircledLink } from './CircledLink';

const meta = {
  title: 'Primitives/CircledLink',
  component: CircledLink,
  args: { href: '#', children: 'recettes' },
} satisfies Meta<typeof CircledLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InASentence: Story = {
  render: (args) => (
    <p className="max-w-measure font-mono text-body">
      Ici, vous pouvez découvrir nos différentes <CircledLink {...args} />{' '}
      signatures.
    </p>
  ),
};
export const Shapes: Story = {
  render: () => (
    <p className="flex gap-10 font-mono text-body">
      <CircledLink href="#" shape={1}>
        technique
      </CircledLink>
      <CircledLink href="#" shape={2}>
        partenaires
      </CircledLink>
      <CircledLink href="#" shape={3}>
        contacter
      </CircledLink>
    </p>
  ),
};
