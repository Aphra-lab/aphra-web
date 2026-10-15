import type { Meta, StoryObj } from '@storybook/react-vite';

import { AGE_CONSENT_KEY } from '../../consent/useAgeConsent';
import { AgeGate } from './AgeGate';

const meta = {
  title: 'Compliance/AgeGate',
  component: AgeGate,
  parameters: { layout: 'fullscreen' },
  args: { children: <p className="p-8 font-mono text-body">Le site</p> },
  beforeEach: () => {
    window.localStorage.removeItem(AGE_CONSENT_KEY);
  },
} satisfies Meta<typeof AgeGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
