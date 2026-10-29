import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

function Clock({ now }: { now?: string }) {
  const [live, setLive] = useState(() => new Date().toISOString());
  useEffect(() => {
    if (now) return;
    const timer = setInterval(() => setLive(new Date().toISOString()), 100);
    return () => clearInterval(timer);
  }, [now]);
  return <section className="note-card" aria-label="Clock"><h1>Orbit clock</h1><output>{now ?? live}</output></section>;
}

const meta = { title: 'Lab/Clock', component: Clock } satisfies Meta<typeof Clock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LiveTimer: Story = {};
export const FixedTime: Story = {
  args: { now: '2026-01-15T09:00:00.000Z' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2026-01-15T09:00:00.000Z')).toBeVisible();
  },
};
