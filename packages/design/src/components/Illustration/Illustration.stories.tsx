import type { Meta, StoryObj } from '@storybook/react-vite';

import { RECIPES } from '../../tokens/recipes';
import { Illustration } from './Illustration';

const meta = {
  title: 'Primitives/Illustration',
  component: Illustration,
  args: {
    name: 'tomate',
    alt: 'Deux tomates sur leur branche',
    className: 'h-96 w-auto',
  },
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tomate: Story = {};
export const Recipes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8">
      {RECIPES.map((recipe) => (
        <figure key={recipe.id} className="flex flex-col items-center gap-2">
          <Illustration
            name={recipe.illustration}
            alt=""
            className="h-64 w-auto"
          />
          <figcaption className="font-mono text-caption">
            {recipe.name}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};
