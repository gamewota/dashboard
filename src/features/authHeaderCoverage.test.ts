import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards the rule that every request behind the login carries the bearer token.
 *
 * This scans slice source rather than exercising each thunk, so slices added
 * later are covered automatically — the failure mode it protects against
 * (GET /gacha/prices 401'ing because the header was omitted) was silent and
 * easy to reintroduce.
 */

const FEATURES_DIR = join(process.cwd(), 'src/features');

/** Endpoints that must NOT send a token, with the reason they are exempt. */
const UNAUTHENTICATED_ENDPOINTS: Record<string, string> = {
  '/users/signin': 'issues the token, so it cannot require one',
};

function collectSliceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return collectSliceFiles(full);
    if (!full.endsWith('.ts') || full.endsWith('.test.ts')) return [];
    return [full];
  });
}

type AxiosCall = { file: string; line: number; method: string; url: string; source: string };

/** Extracts each axios.<method>(...) call with balanced-paren matching. */
function findAxiosCalls(file: string): AxiosCall[] {
  const source = readFileSync(file, 'utf8');
  const calls: AxiosCall[] = [];
  const pattern = /axios\.(get|post|put|patch|delete)\(/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    let depth = 0;
    let end = source.length;
    for (let i = match.index + match[0].length - 1; i < source.length; i++) {
      if (source[i] === '(') depth++;
      else if (source[i] === ')') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const callSource = source.slice(match.index, end);
    const url = /`([^`]*)`/.exec(callSource)?.[1] ?? '';
    calls.push({
      file: file.replace(process.cwd() + '/', ''),
      line: source.slice(0, match.index).split('\n').length,
      method: match[1].toUpperCase(),
      url,
      source: callSource,
    });
  }
  return calls;
}

const allCalls = collectSliceFiles(FEATURES_DIR).flatMap(findAxiosCalls);

describe('auth header coverage across feature slices', () => {
  test('finds axios calls to scan (guards against the scanner silently matching nothing)', () => {
    expect(allCalls.length).toBeGreaterThan(30);
  });

  test('every authenticated request sends getAuthHeader()', () => {
    const exempt = Object.keys(UNAUTHENTICATED_ENDPOINTS);

    const missing = allCalls
      .filter((call) => !exempt.some((endpoint) => call.url.includes(endpoint)))
      .filter((call) => !call.source.includes('getAuthHeader'))
      .map((call) => `${call.file}:${call.line} ${call.method} ${call.url}`);

    expect(missing).toEqual([]);
  });

  test('the login endpoint stays unauthenticated', () => {
    const signin = allCalls.find((call) => call.url.includes('/users/signin'));

    expect(signin).toBeDefined();
    expect(signin?.source).not.toContain('getAuthHeader');
  });
});
