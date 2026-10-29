import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { NoteCard } from '@story-lab/ui';
import { deferred, fixtureService, record, remoteService } from './fixtures';

const meta = { title: 'Lab/Note card', component: NoteCard } satisfies Meta<typeof NoteCard>;
export default meta;
type Story = StoryObj<typeof meta>;

async function expectBadge(canvas: Parameters<NonNullable<Story['play']>>[0]['canvas']) {
  const image = canvas.getByRole('img', { name: 'Orbit badge' }) as HTMLImageElement;
  await waitFor(async () => {
    await expect(image.complete && image.naturalWidth > 0).toBe(true);
  });
}

export const Ready: Story = {
  args: { service: fixtureService() },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: record.title })).toBeVisible();
    const timestamp = canvas.getByText(record.updatedAt);
    await expect(timestamp).toHaveAttribute('datetime', record.updatedAt);
    await expect(timestamp.parentElement).toHaveTextContent(`Updated ${record.updatedAt}`);
    await expect(canvas.getByRole('button', { name: 'Save note' })).toBeDisabled();
    await expectBadge(canvas);
  },
};

export const Loading: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => {
    const pending = deferred<typeof record>();
    args.service = { ...fixtureService(), load: () => pending.promise };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('status')).toHaveTextContent('Loading note…');
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
  },
};

export const Saved: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => { args.service = { ...fixtureService(), save: fn(async () => undefined) }; },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('heading', { name: record.title });
    await userEvent.type(canvas.getByRole('textbox', { name: 'Note' }), 'Check the orbit');
    await userEvent.click(canvas.getByRole('button', { name: 'Save note' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('Saved note: Check the orbit');
    await expect(args.service.save).toHaveBeenCalledWith('Check the orbit');
    await expect(args.service.save).toHaveBeenCalledTimes(1);
    await expectBadge(canvas);
  },
};

export const Saving: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => {
    const pending = deferred<void>();
    args.service = { ...fixtureService(), save: fn(() => pending.promise) };
  },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('heading', { name: record.title });
    await userEvent.type(canvas.getByRole('textbox', { name: 'Note' }), 'Check the orbit');
    await userEvent.click(canvas.getByRole('button', { name: 'Save note' }));
    await expect(await canvas.findByRole('button', { name: 'Saving…' })).toBeDisabled();
    await expect(args.service.save).toHaveBeenCalledWith('Check the orbit');
    await expect(args.service.save).toHaveBeenCalledTimes(1);
    await expectBadge(canvas);
  },
};

export const LoadError: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => {
    args.service = { ...fixtureService(), load: async () => { throw new Error('Synthetic load failure'); } };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Could not load note.');
    await expect(canvas.getByRole('button', { name: 'Retry load' })).toBeEnabled();
  },
};

export const RetryLoad: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => {
    args.service = {
      ...fixtureService(),
      load: fn().mockRejectedValueOnce(new Error('Synthetic load failure')).mockResolvedValue({ ...record }),
    };
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Could not load note.');
    await userEvent.click(canvas.getByRole('button', { name: 'Retry load' }));
    await expect(await canvas.findByRole('heading', { name: record.title })).toBeVisible();
    await expect(args.service.load).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expectBadge(canvas);
  },
};

export const RetrySave: Story = {
  args: { service: fixtureService() },
  beforeEach: ({ args }) => {
    args.service = {
      ...fixtureService(),
      save: fn().mockRejectedValueOnce(new Error('Synthetic save failure')).mockResolvedValue(undefined),
    };
  },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('heading', { name: record.title });
    await userEvent.type(canvas.getByRole('textbox', { name: 'Note' }), 'Check the orbit');
    await userEvent.click(canvas.getByRole('button', { name: 'Save note' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Could not save note.');
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveValue('Check the orbit');
    await userEvent.click(canvas.getByRole('button', { name: 'Save note' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('Saved note: Check the orbit');
    await expect(args.service.save).toHaveBeenNthCalledWith(1, 'Check the orbit');
    await expect(args.service.save).toHaveBeenNthCalledWith(2, 'Check the orbit');
    await expect(args.service.save).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expectBadge(canvas);
  },
};

// Deliberately unstable inputs. Fix the service boundary with Ready's fixture.
export const RemoteInputs: Story = { args: { service: remoteService() } };
