const puppeteer = require('puppeteer')

async function run() {
  const url = process.env.URL || 'http://127.0.0.1:5174/?profiler'
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(20000)

  const logs = []
  page.on('console', msg => {
    try {
      const text = msg.text()
      logs.push(text)
      // mirror to stdout
      console.log('[page]', text)
    } catch (e) {}
  })

  await page.goto(url)
  await page.waitForSelector('#player-table')

  // Wait for Run Profiler button (dev-only)
  const btn = await page.$('button[\@click="runProfiler()"], button:has-text("Run Profiler")')
  // fallback: find by text
  let buttonHandle = btn
  if (!buttonHandle) {
    const handles = await page.$x("//button[contains(., 'Run Profiler')]")
    if (handles && handles.length) buttonHandle = handles[0]
  }

  if (!buttonHandle) {
    console.error('Run Profiler button not found on page; ensure ?profiler is present in URL and app built with profiler UI')
    await browser.close()
    process.exit(2)
  }

  // Click the button to run profiler
  await buttonHandle.click()

  // Wait for profiler summary in console logs
  const start = Date.now()
  let summaryLine = null
  while (Date.now() - start < 20000) {
    for (const l of logs) {
      if (l.indexOf('[profiler] summary') !== -1) {
        summaryLine = l
        break
      }
    }
    if (summaryLine) break
    await new Promise(r => setTimeout(r, 200))
  }

  if (!summaryLine) {
    console.error('Profiler summary not found in page console logs; dumping collected logs:')
    console.error(logs.join('\n'))
    await browser.close()
    process.exit(3)
  }

  // Find the JSON object printed after the summary prefix in logs
  // The page prints: [profiler] summary <object>
  // We'll look for the next log entry that starts with '{' or contains 'p50'
  let found = null
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].indexOf('[profiler] summary') !== -1) {
      // try next entry
      if (i + 1 < logs.length) found = logs[i+1]
      break
    }
  }

  // If not found, as fallback, combine logs and try to extract the JSON substring
  let parsed = null
  try {
    if (found) {
      // try to parse any JSON-like substring
      const maybe = found.trim()
      parsed = JSON.parse(maybe)
    } else {
      // try to locate a JSON-like substring from summaryLine
      const idx = summaryLine.indexOf('{')
      if (idx !== -1) {
        const sub = summaryLine.slice(idx)
        parsed = JSON.parse(sub)
      }
    }
  } catch (e) {
    // if parse failed, just output raw logs
    console.error('Failed to parse profiler JSON from logs; raw logs:')
    console.error(logs.join('\n'))
    await browser.close()
    process.exit(4)
  }

  console.log('Parsed profiler summary:')
  console.log(JSON.stringify(parsed, null, 2))

  await browser.close()
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
