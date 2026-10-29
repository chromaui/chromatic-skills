import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const scenarios = JSON.parse(await readFile(new URL('./capture-scenarios.json', import.meta.url), 'utf8'));

export function checkAnswers(answers) {
  return scenarios.flatMap(({ id, expected }) =>
    Object.entries(expected).filter(([field, value]) => answers[id]?.[field] !== value)
      .map(([field]) => `${id}: reconsider ${field}`));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Pass a local JSON answer file. Read capture-scenarios.json first.');
  const errors = checkAnswers(JSON.parse(await readFile(process.argv[2], 'utf8')));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('All three action, coverage, and capture-cost answers pass.');
  }
}
