#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { assessDelegation } from './policy.mjs';
import { buildWorkOrder } from './workorder.mjs';
import { createReceipt } from './audit.mjs';
import { gibworkDoctor, publishDraft } from './gibwork-cli.mjs';
import { verifyEvidence } from './verify.mjs';

const [, , command, ...args] = process.argv;

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.resolve(file), 'utf8'));
}
async function writeJson(file, data) {
  const absolute = path.resolve(file);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, `${JSON.stringify(data, null, 2)}\n`);
  return absolute;
}
function argValue(flag, fallback = null) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function main() {
  if (!command || ['help', '--help', '-h'].includes(command)) return printHelp();

  if (command === 'doctor') {
    const doctor = await gibworkDoctor();
    console.log(JSON.stringify({
      node: process.version,
      nodeOk: Number(process.versions.node.split('.')[0]) >= 22,
      gibworkCli: doctor
    }, null, 2));
    process.exitCode = doctor.installed ? 0 : 2;
    return;
  }

  if (command === 'assess') {
    const task = await readJson(args[0]);
    console.log(JSON.stringify(assessDelegation(task), null, 2));
    return;
  }

  if (command === 'draft') {
    const task = await readJson(args[0]);
    const outDir = argValue('--out', './artifacts');
    const assessment = assessDelegation(task);
    const assessmentPath = await writeJson(path.join(outDir, 'assessment.json'), assessment);
    if (assessment.decision === 'BLOCK') {
      console.error(`BLOCKED. Review ${assessmentPath}`);
      process.exitCode = 3;
      return;
    }
    const workOrder = buildWorkOrder(assessment);
    const receipt = createReceipt(workOrder, assessment);
    const workOrderPath = await writeJson(path.join(outDir, 'work-order.json'), workOrder);
    const gibworkPath = await writeJson(path.join(outDir, 'gibwork-task.json'), workOrder.gibworkTask);
    const receiptPath = await writeJson(path.join(outDir, 'delegation-receipt.json'), receipt);
    console.log(JSON.stringify({ decision: assessment.decision, score: assessment.score, workOrderPath, gibworkPath, receiptPath }, null, 2));
    return;
  }

  if (command === 'publish') {
    const workOrder = await readJson(args[0]);
    const profile = argValue('--profile', 'stage');
    const result = await publishDraft(workOrder.gibworkTask ?? workOrder, { profile });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exitCode = result.code;
    return;
  }

  if (command === 'verify') {
    const workOrder = await readJson(args[0]);
    const evidence = await readJson(args[1]);
    const report = verifyEvidence(workOrder, evidence);
    const out = argValue('--out', './artifacts/verification.json');
    await writeJson(out, report);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === 'READY_TO_REVIEW' ? 0 : 4;
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function printHelp() {
  console.log(`Gibwork Escalation Bridge\n\nCommands:\n  doctor\n  assess <task.json>\n  draft <task.json> [--out ./artifacts]\n  publish <work-order.json> [--profile stage|production]\n  verify <work-order.json> <submission-evidence.json> [--out verification.json]\n\nProduction publish is fail-closed and requires GIB_ESCALATE_ALLOW_PRODUCTION=YES.`);
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
