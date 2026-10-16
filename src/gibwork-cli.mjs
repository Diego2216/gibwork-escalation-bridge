import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function gibworkDoctor() {
  const result = await runGibwork(['--json', 'update', '--check'], { tolerateMissing: true });
  return {
    installed: result.code !== 127,
    code: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

export async function publishDraft(gibworkTask, { profile = 'stage' } = {}) {
  if (!['stage', 'production'].includes(profile)) throw new Error('profile must be stage or production');
  if (profile === 'production' && process.env.GIB_ESCALATE_ALLOW_PRODUCTION !== 'YES') {
    throw new Error('Production publish blocked. Set GIB_ESCALATE_ALLOW_PRODUCTION=YES only after reviewing the generated task JSON.');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gib-escalate-'));
  const inputPath = path.join(tempDir, 'task.json');
  await fs.writeFile(inputPath, JSON.stringify(gibworkTask, null, 2), { mode: 0o600 });
  try {
    return await runGibwork(['--profile', profile, '--json', 'task', 'create', '--from', inputPath]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function runGibwork(args, { tolerateMissing = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'gibwork.cmd' : 'gibwork', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => {
      if (tolerateMissing && error.code === 'ENOENT') return resolve({ code: 127, stdout, stderr: error.message });
      reject(error);
    });
    child.on('close', code => resolve({ code: code ?? 1, stdout, stderr }));
  });
}
