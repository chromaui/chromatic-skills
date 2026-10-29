import type { NoteRecord, NoteService } from '@story-lab/ui';

export const record: NoteRecord = {
  title: 'Orbit notebook',
  updatedAt: '2026-01-15T09:00:00.000Z',
  imageUrl: '/orbit.svg',
};

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

export function fixtureService(): NoteService {
  return { load: async () => ({ ...record }), save: async () => undefined };
}

// This deliberately bad input uses reserved .invalid hosts, never a real service.
export function remoteService(): NoteService {
  return {
    load: async () => {
      const response = await fetch('https://api.story-lab.invalid/note');
      if (!response.ok) throw new Error('Remote load failed');
      return response.json();
    },
    save: async () => undefined,
  };
}
