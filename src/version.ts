/**
 * App version injected at build time via vite `define`.
 * Tests get a stub value ('test') from the vite test config.
 */
declare const __APP_VERSION__: string;

export const APP_VERSION: string = __APP_VERSION__;
