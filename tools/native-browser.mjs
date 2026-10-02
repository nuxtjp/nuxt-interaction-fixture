import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

// Playwright normally forces focus/visibility. Its public noDefaults CDP option
// lets this separately owned, temporary Linux browser expose real tab lifecycle.
export async function startNativeBrowser() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'interaction-browser-'))
  const child = spawn(chromium.executablePath(), ['--no-sandbox','--no-first-run','--no-default-browser-check',
    '--disable-background-networking','--disable-component-update','--disable-sync','--disable-extensions',
    '--disable-popup-blocking','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
    `--user-data-dir=${directory}`,'about:blank'], {detached:true,stdio:['ignore','ignore','pipe']})
  let output = '', browser, failed
  child.stderr.on('data', value => { output = (output + value.toString()).slice(-4096) })
  child.on('error', error => { failed = error })
  const exited = new Promise(resolve => child.once('close', resolve))
  async function close() {
    try { await browser?.close() }
    finally {
      if (child.exitCode === null && child.signalCode === null && child.pid) {
        const kill = signal => { try { process.kill(-child.pid, signal) } catch (error) { if (error.code !== 'ESRCH') throw error } }
        kill('SIGTERM')
        const force = setTimeout(() => kill('SIGKILL'), 2000)
        await exited; clearTimeout(force)
      }
      await fs.rm(directory, {recursive:true,force:true})
    }
  }
  try {
    let port
    for (let i = 0; i < 100; i++) {
      if (failed || child.exitCode !== null) throw new Error(`fixture/browser/start: ${failed ?? output}`)
      try { port = Number((await fs.readFile(path.join(directory,'DevToolsActivePort'),'utf8')).split('\n')[0]) } catch (error) { if (error.code !== 'ENOENT') throw error }
      if (Number.isInteger(port) && port > 0 && port < 65536) break
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    if (!port) throw new Error('fixture/browser/start/timeout')
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, {noDefaults:true})
    return {context:browser.contexts()[0],close}
  } catch (error) { await close(); throw error }
}
