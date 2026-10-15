import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Header, type HeaderProps } from './Header';

function HeaderDemo(props: HeaderProps) {
  const [open, setOpen] = useState(props.menuOpen);
  return (
    <div className="mx-auto max-w-letter px-20">
      <Header {...props} menuOpen={open} onMenuToggle={() => setOpen(!open)} />
    </div>
  );
}

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: { menuOpen: false, onMenuToggle: () => undefined, bottlesSold: 450 },
  render: (args) => <HeaderDemo {...args} />,
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CounterLoading: Story = { args: { bottlesSold: undefined } };
