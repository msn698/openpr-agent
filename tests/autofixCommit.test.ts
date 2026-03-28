import { describe, it, expect } from 'vitest';
import { executeAutofixCommit } from '../src/github/autofixCommit.js';

describe('executeAutofixCommit', () => {
  it('returns blocked for fork PRs', async () => {
    const client = {
      pulls: {
        get: async () => ({
          data: {
            head: { ref: 'feature/a', sha: 'abc123', repo: { full_name: 'fork/repo' } },
            base: { repo: { full_name: 'main/repo' } }
          }
        }),
        listFiles: async () => ({ data: [] })
      },
      repos: { getContent: async () => ({ data: { content: '' } }) },
      git: {
        getCommit: async () => {
          throw new Error('should not be called');
        },
        createBlob: async () => {
          throw new Error('should not be called');
        },
        createTree: async () => {
          throw new Error('should not be called');
        },
        createCommit: async () => {
          throw new Error('should not be called');
        },
        updateRef: async () => {
          throw new Error('should not be called');
        }
      }
    };

    const result = await executeAutofixCommit({
      client: client as never,
      owner: 'o',
      repo: 'r',
      pullNumber: 1
    });

    expect(result.status).toBe('blocked');
  });

  it('returns no_changes when no deterministic edits apply', async () => {
    const client = {
      pulls: {
        get: async () => ({
          data: {
            head: { ref: 'feature/a', sha: 'abc123', repo: { full_name: 'main/repo' } },
            base: { repo: { full_name: 'main/repo' } }
          }
        }),
        listFiles: async () => ({ data: [{ filename: 'src/app.ts' }] })
      },
      repos: {
        getContent: async () => ({
          data: {
            content: Buffer.from('const ok = true;\n', 'utf8').toString('base64')
          }
        })
      },
      git: {
        getCommit: async () => {
          throw new Error('should not be called');
        },
        createBlob: async () => {
          throw new Error('should not be called');
        },
        createTree: async () => {
          throw new Error('should not be called');
        },
        createCommit: async () => {
          throw new Error('should not be called');
        },
        updateRef: async () => {
          throw new Error('should not be called');
        }
      }
    };

    const result = await executeAutofixCommit({
      client: client as never,
      owner: 'o',
      repo: 'r',
      pullNumber: 1
    });

    expect(result.status).toBe('no_changes');
    expect(result.branch).toBe('feature/a');
  });
});
