import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import sharp from 'sharp'

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] })
const metrics = []
const backupFiles = new Set((await fs.readdir('model-backups')).filter(file => file.endsWith('.glb')))
// Stream large backups over a temporary loopback-only test server. Passing a
// 92 MiB GLB through route.fulfill would inflate it into a huge protocol message.
const backupServer = createServer(async (request, response) => {
  const file = request.url.slice(1)
  if (!backupFiles.has(file)) { response.writeHead(404).end(); return }
  const path = `model-backups/${file}`
  response.writeHead(200, {
    'Content-Type': 'model/gltf-binary',
    'Content-Length': (await fs.stat(path)).size,
    'Access-Control-Allow-Origin': '*'
  })
  createReadStream(path).pipe(response)
})
await new Promise(resolve => backupServer.listen(0, '127.0.0.1', resolve))
const backupOrigin = `http://127.0.0.1:${backupServer.address().port}`
try {
for (const variant of ['original', 'optimized']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  if (variant === 'original') {
    // Only this test redirects requests; Vite and production never serve backups.
    await page.route('**/models/optimized/*.glb', async route => {
      const file = new URL(route.request().url()).pathname.split('/').pop()
      if (!backupFiles.has(file)) throw new Error(`Missing original model backup: ${file}`)
      await route.continue({ url: `${backupOrigin}/${file}` })
    })
  }
  await page.route('**/src/main.js', async route => {
    const response = await route.fetch()
    let body = await response.text()
    body = body.replace('const deltaTime = clock.getDelta()', 'const deltaTime = 0').replace('const elapsedTime = clock.elapsedTime', 'const elapsedTime = 0')
    body += '\nfireflies.visible = false; window.__comparison = { camera, controls, modelGroup, get ready() { return !!(horseMixer && dogMixer && duckMixer && butterflyMixer && catMixer && rabbitMixer && wavingMixer && airplane && potionIsland) } };'
    await route.fulfill({ response, body })
  })
  await page.goto(process.env.PORTFOLIO_URL ?? 'http://127.0.0.1:5174/')
  await page.waitForFunction(() => window.__comparison?.ready, null, { timeout: 120000 })
  await page.waitForTimeout(2000)
  for (const view of ['front', 'back']) {
    if (view === 'back') {
      await page.evaluate(() => { window.__comparison.camera.position.set(-5, 4, -5); window.__comparison.controls.update() })
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: `reports/${variant}-${view}.png` })
  }
  await page.close()
}
} finally {
  await browser.close()
  await new Promise(resolve => backupServer.close(resolve))
}
for (const view of ['front', 'back']) {
  const a = await sharp(`reports/original-${view}.png`).removeAlpha().raw().toBuffer()
  const b = await sharp(`reports/optimized-${view}.png`).removeAlpha().raw().toBuffer()
  let squared = 0, changed = 0
  for (let i = 0; i < a.length; i++) { squared += (a[i] - b[i]) ** 2; if (Math.abs(a[i] - b[i]) > 10) changed++ }
  metrics.push({ view, rmse: Math.sqrt(squared / a.length), psnrDB: 10 * Math.log10(255 ** 2 / (squared / a.length)), channelsDifferingByMoreThan10Percent: 100 * changed / a.length })
}
await fs.writeFile('reports/appearance-comparison.json', JSON.stringify(metrics, null, 2))
console.log(metrics)
