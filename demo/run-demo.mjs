import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const cli = path.join(root, 'src', 'cli.mjs');
const task = path.join(root, 'examples', 'stuck-agent-task.json');
const unsafe = path.join(root, 'examples', 'unsafe-task.json');
const evidence = path.join(root, 'examples', 'submission-evidence.json');
const out = path.join(root, 'artifacts');

function run(args, allowFailure = false) {
  console.log(`\n$ node src/cli.mjs ${args.join(' ')}`);
  try {
    const output = execFileSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    process.stdout.write(output);
  } catch (error) {
    if (!allowFailure) throw error;
    process.stdout.write(error.stdout?.toString() || '');
    process.stderr.write(error.stderr?.toString() || '');
  }
}

run(['assess', task]);
run(['draft', task, '--out', out]);
run(['verify', path.join(out, 'work-order.json'), evidence, '--out', path.join(out, 'verification.json')]);
run(['assess', unsafe], true);
console.log('\nDemo complete. No wallet, funds or production systems were touched.');
