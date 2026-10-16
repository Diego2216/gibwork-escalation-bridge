import path from 'node:path';

const SECRET_PATTERNS = [
  { name: 'private_key', re: /\b(?:private[_ -]?key|seed phrase|mnemonic)\b\s*[:=]?\s*[^\s,;]+/gi },
  { name: 'api_key', re: /\b(?:api[_ -]?key|token|secret|password)\b\s*[:=]\s*[^\s,;]+/gi },
  { name: 'github_token', re: /\b(?:ghp|github_pat)_[A-Za-z0-9_\-]+/g },
  { name: 'bearer_token', re: /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi },
  { name: 'solana_secret_array', re: /\[(?:\s*\d+\s*,){31,63}\s*\d+\s*\]/g }
];

const PII_PATTERNS = [
  { name: 'email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { name: 'windows_home', re: /[A-Za-z]:\\Users\\[^\\\s]+/g },
  { name: 'unix_home', re: /\/(?:home|Users)\/[^/\s]+/g },
  { name: 'ipv4', re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g }
];

export function redactText(input = '') {
  let text = String(input);
  const findings = [];

  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern.re, match => {
      findings.push({ type: pattern.name, severity: 'BLOCK', sample: mask(match) });
      return `[REDACTED:${pattern.name.toUpperCase()}]`;
    });
  }
  for (const pattern of PII_PATTERNS) {
    text = text.replace(pattern.re, match => {
      findings.push({ type: pattern.name, severity: 'REDACT', sample: mask(match) });
      return `[REDACTED:${pattern.name.toUpperCase()}]`;
    });
  }
  return { text, findings };
}

export function redactObject(value) {
  const findings = [];
  const visit = current => {
    if (typeof current === 'string') {
      const result = redactText(current);
      findings.push(...result.findings);
      return result.text;
    }
    if (Array.isArray(current)) return current.map(visit);
    if (current && typeof current === 'object') {
      return Object.fromEntries(Object.entries(current).map(([key, val]) => {
        if (/private|secret|seed|mnemonic|password/i.test(key)) {
          findings.push({ type: `field:${key}`, severity: 'BLOCK', sample: '[FIELD REDACTED]' });
          return [key, `[REDACTED:${key.toUpperCase()}]`];
        }
        return [key, visit(val)];
      }));
    }
    return current;
  };
  return { value: visit(value), findings };
}

export function safeOutputPath(filePath) {
  return path.resolve(filePath);
}

function mask(value) {
  const text = String(value);
  if (text.length <= 8) return '*'.repeat(text.length);
  return `${text.slice(0, 3)}…${text.slice(-3)}`;
}
