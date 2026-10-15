import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { children: "Bienvenue, vous êtes sur le site internet d'Aphra." },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: 'body' } };
export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'BOISSON DU XVIIe REPENSÉE POUR LE XXIe',
  },
};
export const Nav: Story = { args: { variant: 'nav', children: 'MENU' } };
