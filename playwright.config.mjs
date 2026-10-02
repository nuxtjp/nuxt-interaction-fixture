import { defineConfig } from '@playwright/test'
// Playwright sets FORCE_COLOR in workers; do not also pass the contradictory NO_COLOR.
delete process.env.NO_COLOR
export default defineConfig({testDir:'./test', workers:1, fullyParallel:false,
  maxFailures:1, retries:0, timeout:60000, reporter:'list',
  // Real tab visibility requires headed Chromium. tools/check.mjs owns a
  // private Linux Xvfb display, never the user's desktop or Windows browser.
  use:{browserName:'chromium',headless:false,viewport:{width:1000,height:740},trace:'retain-on-failure'}})
