import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright';

const port = 4173;
const url = `http://127.0.0.1:${port}/robolab-arena/`;

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
preview.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
preview.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 12000) {
    if (output.includes(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Preview server did not expose ${url}. Output:\n${output}`);
}

async function measureFrames(page, durationMs) {
  return page.evaluate(async (duration) => {
    const frames = [];
    let last = performance.now();
    const end = last + duration;
    await new Promise((resolve) => {
      const tick = (now) => {
        frames.push(now - last);
        last = now;
        if (now >= end) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    const sorted = [...frames].sort((a, b) => a - b);
    const average = frames.reduce((sum, value) => sum + value, 0) / frames.length;
    return {
      frameCount: frames.length,
      averageMs: Number(average.toFixed(2)),
      p95Ms: Number((sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(2)),
      longFramesOver20ms: frames.filter((value) => value > 20).length,
      fpsApprox: Number((1000 / average).toFixed(1))
    };
  }, durationMs);
}

let browser;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  const menu = await measureFrames(page, 900);
  await page.getByRole('button', { name: /Почати гру/ }).click();
  await page.waitForTimeout(400);
  const playing = await measureFrames(page, 1600);
  const dom = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    nodeCount: document.querySelectorAll('*').length,
    hudSample: Array.from(document.querySelectorAll('.status-chip,.objective-chip,.toast-chip'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .slice(0, 6)
  }));

  if (dom.canvasCount !== 1) {
    throw new Error(`Expected one canvas, found ${dom.canvasCount}`);
  }

  console.log(JSON.stringify({ url, menu, playing, dom }, null, 2));
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
  await Promise.race([
    once(preview, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 1000))
  ]);
}
