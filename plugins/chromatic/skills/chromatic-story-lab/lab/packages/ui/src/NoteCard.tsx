import { useEffect, useState } from 'react';
import './note-card.css';

export type NoteRecord = { title: string; updatedAt: string; imageUrl: string };
export type NoteService = {
  load: () => Promise<NoteRecord>;
  save: (note: string) => Promise<void>;
};

export function NoteCard({ service }: { service: NoteService }) {
  const [record, setRecord] = useState<NoteRecord>();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setError('');
    setRecord(undefined);
    service.load().then(
      (value) => { if (active) setRecord(value); },
      () => { if (active) setError('Could not load note.'); },
    );
    return () => { active = false; };
  }, [service, attempt]);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await service.save(note);
      setSaved(true);
    } catch {
      setError('Could not save note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="note-card" aria-label="Orbit note">
      {!record ? error ? <>
        <p role="alert">{error}</p>
        <button onClick={() => setAttempt(attempt + 1)}>Retry load</button>
      </> : <p role="status">Loading note…</p> : <>
        <header>
          <img src={record.imageUrl} alt="Orbit badge" width="48" height="48" />
          <h1>{record.title}</h1>
        </header>
        <p>Updated <time dateTime={record.updatedAt}>{record.updatedAt}</time></p>
        <label htmlFor="note">Note</label>
        <input id="note" value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} />
        <button disabled={!note.trim() || saving} onClick={save}>{saving ? 'Saving…' : 'Save note'}</button>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">Saved note: {note}</p>}
      </>}
    </section>
  );
}
