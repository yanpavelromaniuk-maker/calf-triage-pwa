/**
 * GitHub Pages base path resolution (shared by vite.config and tests).
 *
 * - In GitHub Actions GITHUB_REPOSITORY is "owner/repo"; project pages serve
 *   the app at https://owner.github.io/<repo>/ → base "/<repo>/".
 * - For owner/owner.github.io (user site) the app lives at the root → "/".
 * - Locally or with a custom domain: "/" — override with the VITE_BASE env var.
 */
export function resolveBase(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.VITE_BASE;
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;
  const repo = env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo && !repo.endsWith('.github.io')) return `/${repo}/`;
  return '/';
}
