import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logomark } from './Logomark';

const meta = {
  title: 'Primitives/Logomark',
  component: Logomark,
} satisfies Meta<typeof Logomark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFaces: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {([1, 2, 3, 4, 5, 6, 'stamp'] as const).map((face) => (
        <Logomark key={face} face={face} className="h-24" />
      ))}
    </div>
  ),
};
export const RecipeColour: Story = {
  args: { face: 3, className: 'h-24 text-red' },
};
