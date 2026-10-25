import assert from 'node:assert/strict'
import { createDeferredModels } from '../src/deferred-models.js'
const queue = createDeferredModels(2)
const pending = []
const started = []
const loader = { load(url, success, progress, fail) { started.push(url); pending.push({success, fail}) } }
for (let i = 0; i < 5; i++) queue.load(loader, String(i), () => {}, undefined, () => {})
assert.equal(started.length, 0)
queue.start()
queue.start()
assert.equal(started.length, 2)
pending[0].success({})
assert.equal(started.length, 3)
pending[1].fail(new Error('simulated failure'))
assert.equal(started.length, 4)
pending[2].success({})
assert.equal(started.length, 5)
pending[3].success({})
pending[4].success({})
console.log('Deferred queue: waits for start, limits concurrency, starts once, continues after failure.')
