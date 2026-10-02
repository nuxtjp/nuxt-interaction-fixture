import { test, expect } from '@playwright/test'
import { startFixture } from '../tools/fixture.mjs'
import { startNativeBrowser } from '../tools/native-browser.mjs'

test('independent Rust / Nuxt: exact SSR, live declarations, actions, conflicts and lifecycle', async ({browser}) => {
  const fixture = await startFixture()
  const context = await browser.newContext()
  const errors = []
  try {
    const page = await context.newPage()
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if (['error','warning'].includes(m.type())) errors.push(m.text()) })
    const response = await page.goto(fixture.url + '/items')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('Ada')
    await expect(page.locator('[data-node="name"] input')).toHaveValue('Ada')
    expect((await fixture.state()).counters.invoke).toBe(0)
    expect((await fixture.state()).counters.read).toBe(1)
    await expect(page.locator('[data-declaration-revision]')).toHaveAttribute('data-declaration-revision','d1')
    await page.locator('[data-node="name"] input').fill('Grace')
    await page.getByRole('button', {name:'Save',exact:true}).click()
    await expect(page.locator('[data-node="display"]')).toContainText('Grace')
    expect((await fixture.state()).scopes['u1/r1'].resources[0].value.name).toBe('Grace')
    await page.getByRole('button', {name:'Save',exact:true}).click()
    await expect(page.locator('[data-node="outcome"]')).toContainText('Success')
    await page.locator('[data-node="name"] input').fill('Unsaved edit')
    await fixture.addField()
    await expect(page.locator('[data-node="extra"] input')).toHaveValue('new field')
    await expect(page.locator('[data-declaration-revision]')).toHaveAttribute('data-declaration-revision','d2')
    await expect(page.locator('[data-node="name"] input')).toHaveValue('Unsaved edit')
    await expect(page.locator('[data-node="module"]')).toHaveText('Module extension: Grace')
    await page.getByRole('button', {name:'Save',exact:true}).click()
    await expect(page.locator('[data-node="outcome"]')).toContainText('PreconditionFailed')
    expect((await fixture.state()).scopes['u1/r1'].resources[0].value.name).toBe('Grace')
    await page.setViewportSize({width:390,height:844})
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.goto(fixture.url + '/added')
    await expect(page.getByRole('heading', {name:'Added at runtime'})).toBeVisible()
    await expect(page.locator('[data-node="newCollection"]')).toContainText('Ada')
    await page.locator('[data-node="newInput"] input').fill('New operation')
    await page.getByRole('button', {name:'Replace',exact:true}).click()
    await expect(page.locator('[data-node="newResult"]')).toContainText('Success')
    expect((await fixture.state()).scopes['u1/r1'].resources[0].value.name).toBe('New operation')
    const receipts = Object.values((await fixture.state()).scopes['u1/r1'].receipts)
    expect(receipts.find(r => r.request.operation_id === 'replace').request.input).toEqual({replacement:'New operation'})
    expect((await fixture.state()).scopes['u1/r1'].resources[0].value.enabled).toBe(false)
    await page.goto(fixture.url + '/empty')
    await expect(page.getByRole('heading', {name:'Empty view'})).toBeVisible()
    expect(errors).toEqual([])
  } finally { await context.close(); await fixture.close() }
})

test('private snapshots and writes do not cross user / role, structured failures remain data', async ({browser}) => {
  const fixture = await startFixture()
  const one = await browser.newContext(), two = await browser.newContext(), role = await browser.newContext()
  let native
  const errors = []
  const observe = page => {
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (['error','warning'].includes(message.type())) errors.push(message.text()) })
  }
  for (const context of [one,two,role]) context.on('page',observe)
  try {
    await two.addCookies([{name:'fixture_scope',value:'u2/r1',url:fixture.url}])
    await role.addCookies([{name:'fixture_scope',value:'u1/r2',url:fixture.url}])
    const a = await one.newPage(), b = await two.newPage(), c = await role.newPage()
    await Promise.all([a.goto(fixture.url+'/items'),b.goto(fixture.url+'/items'),c.goto(fixture.url+'/items')])
    await expect(a.locator('[data-node="name"] input')).toHaveValue('Ada')
    await expect(b.locator('[data-node="name"] input')).toHaveValue('Lin')
    await expect(c.locator('[data-node="name"] input')).toHaveValue('Role two')
    await a.locator('[data-node="name"] input').fill('')
    await a.getByRole('button',{name:'Save',exact:true}).click()
    await expect(a.locator('[data-node="outcome"]')).toContainText('ValidationError')
    await expect(b.locator('[data-node="name"] input')).toHaveValue('Lin')
    const state = await fixture.state()
    expect(state.scopes['u1/r1'].resources[0].value.name).toBe('Ada')
    expect(state.scopes['u2/r1'].resources[0].value.name).toBe('Lin')
    await a.locator('[data-node="name"] input').fill('Authorized write')
    await a.getByRole('button',{name:'Save',exact:true}).click()
    await expect(a.locator('[data-node="display"]')).toContainText('Authorized write')
    const accepted = await fixture.state()
    const receipt = Object.values(accepted.scopes['u1/r1'].receipts)[0]
    accepted.scopes['u1/r1'].resources[0].contract.operations[0].availability = {state:'forbidden',reason:'permission/revoked'}
    accepted.scopes['u1/r1'].cursor += '/revoked'
    await fixture.configure(accepted)
    await expect(a.getByRole('button',{name:'Save',exact:true})).toBeDisabled()
    const replay = await a.evaluate(async params => (await fetch('/api/interaction',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method:'invoke',params})})).json(), receipt.request)
    expect(replay).toEqual({status:'Forbidden',reason:'permission/revoked',issues:[]})
    expect((await fixture.state()).scopes['u1/r1'].sequence).toBe(accepted.scopes['u1/r1'].sequence)
    // Failure is data through SSR and the live read loop, not an HTTP error page.
    for (const status of ['ValidationError','Conflict','Forbidden','Unavailable','NotFound','PreconditionFailed']) {
      const updated = await fixture.state()
      updated.read_failures = {items:{status,reason:'fixture/read/rejected',issues:[{path:'/name',reason:'fixture/field/rejected'}]}}
      for (const scope of Object.values(updated.scopes)) scope.cursor += '/' + status
      await fixture.configure(updated)
      await expect(a.locator('[data-outcome]')).toHaveAttribute('data-outcome',status)
      await expect(a.getByRole('alert')).toContainText('/name fixture/field/rejected')
      expect(await a.locator('[data-node="display"]').count()).toBe(0)
      const ssr = await a.request.get(fixture.url+'/items')
      expect(ssr.status()).toBe(200)
      expect(await ssr.text()).toContain(`data-outcome="${status}"`)
    }
    const restored = await fixture.state()
    delete restored.read_failures
    await fixture.configure(restored)
    await expect(a.locator('[data-node="display"]')).toContainText('Authorized write')
    // A declaration cannot execute markup/code, even when delivered by the provider.
    const injected = structuredClone(restored)
    injected.declarations.items.nodes.push({id:'injected',kind:'display',resource:'draft',html:'<script>window.INJECTED=true</script>'})
    for (const scope of Object.values(injected.scopes)) scope.cursor += '/injected'
    await fixture.configure(injected)
    await expect(a.locator('[data-outcome]')).toHaveAttribute('data-outcome','Unavailable')
    await expect(a.getByRole('alert')).toContainText('node/fields/invalid')
    expect(await a.evaluate(() => window.INJECTED)).toBeUndefined()
    for (const scope of Object.values(restored.scopes)) scope.cursor += '/restored'
    await fixture.configure(restored)
    await expect(a.locator('[data-node="display"]')).toContainText('Authorized write')
    await a.close(); await b.close(); await c.close()
    // A real browser tab change, not a document.hidden property stub.
    native = await startNativeBrowser()
    const active = native.context.pages()[0]
    observe(active)
    await active.goto(fixture.url+'/items')
    await expect(active.locator('[data-node="display"]')).toContainText('Authorized write')
    const opened = native.context.waitForEvent('page')
    await active.evaluate(() => window.open('about:blank', '_blank'))
    const cover = await opened
    await cover.bringToFront()
    await expect.poll(() => active.evaluate(() => document.hidden)).toBe(true)
    await active.waitForTimeout(600)
    const hidden = (await fixture.state()).counters.subscribe
    await active.waitForTimeout(1100)
    expect((await fixture.state()).counters.subscribe).toBe(hidden)
    await active.bringToFront()
    await expect.poll(() => active.evaluate(() => document.hidden)).toBe(false)
    await expect.poll(async () => (await fixture.state()).counters.subscribe).toBeGreaterThan(hidden)
    await cover.close()
    const interrupted = await fetch(fixture.url+'/api/interaction',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method:'interrupt',params:{}})})
    expect((await interrupted.json()).transport_error.code).toBe('transport/unavailable')
    const recovered = await active.evaluate(async () => (await fetch('/api/interaction',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method:'read',params:{view:'items'}})})).json())
    expect(recovered.status).toBe('Success')
    expect(recovered.value.resources[0].value.name).toBe('Authorized write')
    expect(errors).toEqual([])
  } finally { await native?.close(); await one.close(); await two.close(); await role.close(); await fixture.close() }
})
