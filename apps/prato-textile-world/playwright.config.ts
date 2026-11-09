import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'./tests/e2e', timeout:40_000, workers:1, retries:0,
  use: { baseURL:'http://127.0.0.1:4177/', browserName:'chromium', launchOptions: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']
  } },
  projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},{name:'mobile',use:{...devices['Pixel 7'],browserName:'chromium'}}],
  webServer:{command:'npm run preview -- --port 4177 --strictPort',url:'http://127.0.0.1:4177/',reuseExistingServer:false,timeout:45_000},
});
