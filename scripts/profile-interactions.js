const puppeteer = require('puppeteer')

async function waitForStable(selector, page, stableMs = 50, timeout = 3000) {
  return await page.evaluate(({ selector, stableMs, timeout }) => {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector)
      if (!el) return reject(new Error('selector-not-found'))
      let timeoutId = null
      let stableTimer = null
      const mo = new MutationObserver(() => {
        if (stableTimer) clearTimeout(stableTimer)
        stableTimer = setTimeout(() => {
          mo.disconnect()
          clearTimeout(timeoutId)
          resolve(true)
        }, stableMs)
      })
      mo.observe(el, { childList: true, subtree: true, attributes: true })
      // if nothing happens, resolve after short timeout
      timeoutId = setTimeout(() => {
        mo.disconnect()
        resolve(true)
      }, timeout)
    })
  }, { selector, stableMs, timeout })
}

async function measureAction(page, actionFn) {
  // perform action in page context and measure until '#player-table' stabilizes
  const start = await page.evaluate(() => performance.now())
  await actionFn()
  await waitForStable('#player-table', page, 50, 3000)
  const end = await page.evaluate(() => performance.now())
  return end - start
}

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(10000)
  await page.goto('http://127.0.0.1:5174/')
  await page.waitForSelector('#player-table')

  // warmup
  await page.waitForTimeout(300)

  const results = {
    search: [],
    checkbox: [],
    viewSwitch: []
  }

  // measure search typing (set value, dispatch input)
  for (let i = 0; i < 20; i++) {
    const q = i % 2 === 0 ? 'an' : 'le'
    const duration = await measureAction(page, async () => {
      await page.evaluate((q) => {
        const el = document.querySelector('input[placeholder="Enter player name..."]')
        el.value = q
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, q)
    })
    results.search.push(duration)
    await page.waitForTimeout(50)
  }

  // measure checkbox toggle
  for (let i = 0; i < 20; i++) {
    const duration = await measureAction(page, async () => {
      await page.evaluate(() => {
        const cb = document.querySelector('input[type=checkbox][value=PG]')
        if (cb) cb.click()
      })
    })
    results.checkbox.push(duration)
    await page.waitForTimeout(50)
  }

  // measure stat view switches
  for (let i = 0; i < 10; i++) {
    const view = i % 2 === 0 ? '2025-26' : '2024-25'
    const duration = await measureAction(page, async () => {
      await page.evaluate((v) => {
        const sel = document.querySelector('select[x-model="activeStatView"]') || document.querySelector('select')
        if (sel) {
          sel.value = v
          sel.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, view)
    })
    results.viewSwitch.push(duration)
    await page.waitForTimeout(100)
  }

  await browser.close()

  function summarize(arr) {
    const sorted = arr.slice().sort((a,b)=>a-b)
    const p = (p)=> sorted[Math.floor(sorted.length * p)]
    return {count: arr.length, p50: p(0.5), p90: p(0.9), p99: p(0.99), max: sorted[sorted.length-1]}
  }

  console.log('summary:')
  console.log('search:', summarize(results.search))
  console.log('checkbox:', summarize(results.checkbox))
  console.log('viewSwitch:', summarize(results.viewSwitch))
}

run().catch(err => { console.error(err); process.exit(1) })
