import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { webManifest } from '../webmanifest';
import { resolveBase } from '../basePath';

const savedEnv = { ...process.env };
afterAll(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in savedEnv)) delete process.env[key];
  }
  Object.assign(process.env, savedEnv);
});

describe('PWA manifest', () => {
  it('is installable: name, standalone display, theme color', () => {
    expect(webManifest.name).toBeTruthy();
    expect(webManifest.short_name).toBeTruthy();
    expect(webManifest.display).toBe('standalone');
    expect(webManifest.theme_color).toMatch(/^#/);
    expect(webManifest.background_color).toMatch(/^#/);
    expect(webManifest.start_url).toBe('.');
    expect(webManifest.scope).toBe('.');
  });

  it('declares 192 and 512 icons plus a maskable icon', () => {
    const sizes = webManifest.icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(webManifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of webManifest.icons) {
      expect(icon.src).toMatch(/^icons\//);
    }
  });

  it('declares Russian language and medical category', () => {
    expect(webManifest.lang).toBe('ru');
    expect(webManifest.categories).toContain('medical');
  });
});

describe('GitHub Pages base path resolution', () => {
  it('uses /<repo>/ for project pages', () => {
    expect(resolveBase({ GITHUB_REPOSITORY: 'owner/calf-triage-pwa' })).toBe(
      '/calf-triage-pwa/',
    );
  });

  it('uses / for user pages (owner.github.io) and local runs', () => {
    expect(resolveBase({ GITHUB_REPOSITORY: 'owner/owner.github.io' })).toBe('/');
    expect(resolveBase({})).toBe('/');
  });

  it('respects an explicit VITE_BASE override', () => {
    expect(resolveBase({ VITE_BASE: '/custom/' })).toBe('/custom/');
    expect(resolveBase({ VITE_BASE: '/custom' })).toBe('/custom/');
    expect(resolveBase({ VITE_BASE: '/custom', GITHUB_REPOSITORY: 'o/repo' })).toBe('/custom/');
  });
});

describe('deploy workflow', () => {
  const workflowPath = resolve(process.cwd(), '.github/workflows/deploy.yml');
  const workflow = readFileSync(workflowPath, 'utf8');

  it('builds, tests and deploys via official Pages actions', () => {
    expect(workflow).toContain('actions/upload-pages-artifact');
    expect(workflow).toContain('actions/deploy-pages');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('npm ci');
  });

  it('scopes permissions to the minimum required set', () => {
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('pages: write');
    expect(workflow).toContain('id-token: write');
  });
});
