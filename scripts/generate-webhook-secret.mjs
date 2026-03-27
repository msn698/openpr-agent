import crypto from 'node:crypto';

const bytes = Number(process.argv[2] ?? 32);
if (!Number.isInteger(bytes) || bytes < 16 || bytes > 128) {
  console.error('Usage: node scripts/generate-webhook-secret.mjs [16-128]');
  process.exit(1);
}

console.log(crypto.randomBytes(bytes).toString('hex'));
