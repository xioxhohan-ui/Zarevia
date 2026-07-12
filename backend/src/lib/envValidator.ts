/**
 * ============================================================
 * ENTERPRISE ENVIRONMENT VALIDATOR
 * Zarevia E-Commerce Platform — Backend
 * ============================================================
 *
 * Run at application startup BEFORE any other module.
 * Validates every required environment variable.
 * Prints a clean diagnostic report and exits gracefully if
 * critical variables are missing.
 */

import 'dotenv/config';

// ─────────────────────────────────────────────
// Variable Descriptor Types
// ─────────────────────────────────────────────

type EnvVarDef = {
  key: string;
  required: boolean;
  description: string;
  example?: string;
  validator?: (value: string) => boolean;
  validatorMessage?: string;
};

// ─────────────────────────────────────────────
// Variable Registry
// ─────────────────────────────────────────────

const ENV_VARS: EnvVarDef[] = [
  // ── Application ──────────────────────────────
  {
    key: 'NODE_ENV',
    required: true,
    description: 'Runtime environment',
    example: 'production',
    validator: (v) => ['development', 'test', 'production'].includes(v),
    validatorMessage: 'Must be one of: development, test, production',
  },
  {
    key: 'PORT',
    required: false,
    description: 'HTTP port the backend listens on',
    example: '5000',
    validator: (v) => !isNaN(Number(v)) && Number(v) > 0,
    validatorMessage: 'Must be a positive integer',
  },
  {
    key: 'FRONTEND_URL',
    required: true,
    description: 'Public URL of the frontend (used for CORS)',
    example: 'https://zarevia.vercel.app',
    validator: (v) => v.startsWith('http'),
    validatorMessage: 'Must be a full URL starting with http or https',
  },

  // ── PostgreSQL ────────────────────────────────
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string (Prisma)',
    example: 'postgresql://user:pass@host:5432/dbname?sslmode=require',
    validator: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
    validatorMessage: 'Must be a valid PostgreSQL connection string',
  },

  // ── JWT Authentication ────────────────────────
  {
    key: 'JWT_SECRET',
    required: true,
    description: 'Secret key for signing access tokens',
    example: 'a-long-random-secret-at-least-32-chars',
    validator: (v) => v.length >= 16,
    validatorMessage: 'Must be at least 16 characters long',
  },
  {
    key: 'JWT_REFRESH_SECRET',
    required: true,
    description: 'Secret key for signing refresh tokens',
    example: 'another-long-random-refresh-secret',
    validator: (v) => v.length >= 16,
    validatorMessage: 'Must be at least 16 characters long',
  },

  // ── Firebase Admin SDK ────────────────────────
  {
    key: 'FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase project ID (from service account)',
    example: 'zarevia',
  },
  {
    key: 'FIREBASE_CLIENT_EMAIL',
    required: true,
    description: 'Firebase service account client email',
    example: 'firebase-adminsdk-xxx@project.iam.gserviceaccount.com',
    validator: (v) => v.includes('@') && v.endsWith('.gserviceaccount.com'),
    validatorMessage: 'Must be a valid service account email ending in .gserviceaccount.com',
  },
  {
    key: 'FIREBASE_PRIVATE_KEY',
    required: true,
    description: 'Firebase service account private key (PEM format, \\n escaped)',
    example: '-----BEGIN PRIVATE KEY-----\\nMII...\\n-----END PRIVATE KEY-----\\n',
    validator: (v) =>
      v.includes('BEGIN PRIVATE KEY') || v.includes('BEGIN RSA PRIVATE KEY'),
    validatorMessage: 'Must contain a valid PEM private key',
  },
  {
    key: 'FIREBASE_STORAGE_BUCKET',
    required: true,
    description: 'Firebase Cloud Storage bucket name',
    example: 'zarevia.firebasestorage.app',
  },

  // ── Optional: Redis ───────────────────────────
  {
    key: 'REDIS_URL',
    required: false,
    description: 'Redis connection URL (optional — for caching/sessions)',
    example: 'redis://localhost:6379',
  },
];

// ─────────────────────────────────────────────
// Validation Engine
// ─────────────────────────────────────────────

type ValidationResult = {
  status: '✓' | '⚠' | '✗';
  key: string;
  message: string;
};

export function validateEnv(): void {
  const results: ValidationResult[] = [];
  const criticalErrors: string[] = [];

  for (const def of ENV_VARS) {
    const raw = process.env[def.key];

    // Missing
    if (raw === undefined || raw === null) {
      if (def.required) {
        results.push({ status: '✗', key: def.key, message: 'MISSING (required)' });
        criticalErrors.push(def.key);
      } else {
        results.push({ status: '⚠', key: def.key, message: 'Not set (optional)' });
      }
      continue;
    }

    // Empty string
    if (raw.trim() === '') {
      if (def.required) {
        results.push({ status: '✗', key: def.key, message: 'EMPTY STRING (required)' });
        criticalErrors.push(def.key);
      } else {
        results.push({ status: '⚠', key: def.key, message: 'Empty string (optional)' });
      }
      continue;
    }

    // Format validation
    if (def.validator && !def.validator(raw)) {
      results.push({
        status: '✗',
        key: def.key,
        message: `INVALID FORMAT — ${def.validatorMessage}`,
      });
      if (def.required) criticalErrors.push(def.key);
      continue;
    }

    results.push({ status: '✓', key: def.key, message: 'OK' });
  }

  // ── Print Report ─────────────────────────────
  console.log('\n════════════════════════════════════════════════════');
  console.log('  ZAREVIA — Environment Variables Diagnostic Report');
  console.log('════════════════════════════════════════════════════');

  const maxKeyLen = Math.max(...results.map((r) => r.key.length));

  for (const r of results) {
    const padded = r.key.padEnd(maxKeyLen + 2);
    console.log(`  ${r.status}  ${padded}${r.message}`);
  }

  console.log('════════════════════════════════════════════════════\n');

  // ── Fail fast on critical errors ─────────────
  if (criticalErrors.length > 0) {
    console.error('🚨  Application cannot start — missing or invalid required variables:\n');
    criticalErrors.forEach((k) => console.error(`     • ${k}`));
    console.error('\n  Please configure the above variables in your .env file or');
    console.error('  Vercel/Zeabur/Railway environment settings before restarting.\n');
    process.exit(1);
  }

  // ── Firebase private key newline warning ─────
  const pk = process.env.FIREBASE_PRIVATE_KEY ?? '';
  if (pk && !pk.includes('\n') && pk.includes('\\n')) {
    console.warn(
      '⚠  FIREBASE_PRIVATE_KEY contains literal \\\\n strings. ' +
        'Ensure your hosting platform stores the key with real newlines or ' +
        'that the code replaces \\\\n → \\n before use.'
    );
  }

  console.log('✅  All required environment variables are configured.\n');
}
