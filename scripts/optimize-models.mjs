import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP } from '@gltf-transform/extensions'
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer'
import sharp from 'sharp'
import { quantize } from '@gltf-transform/functions'

// Originals remain untouched. No decimation, texture resizing, or clip removal.
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
await fs.mkdir('public/models/optimized', { recursive: true })
const report = []
for (const file of (await fs.readdir('model-backups')).filter(f => f.endsWith('.glb'))) {
  const input = `model-backups/${file}`
  const output = `public/models/optimized/${file}`
  const doc = await io.read(input)
  const root = doc.getRoot()
  await doc.transform(quantize({ quantizePosition: 16, quantizeNormal: 16, quantizeTexcoord: 16, quantizeWeight: 16 }))
  const accessorCount = root.listAccessors().length
  const clips = root.listAnimations().map(a => a.getName())
  for (const texture of root.listTextures()) {
    const image = texture.getImage()
    if (!image) continue
    const compressed = await sharp(image).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toBuffer()
    if (compressed.length < image.length) {
      const before = await sharp(image).metadata()
      const after = await sharp(compressed).metadata()
      assert.equal(after.width, before.width)
      assert.equal(after.height, before.height)
      texture.setImage(compressed).setMimeType('image/webp')
      doc.createExtension(EXTTextureWebP).setRequired(true)
    }
  }
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
  await io.write(output, doc)
  const decoded = (await io.read(output)).getRoot()
  assert.deepEqual(decoded.listAnimations().map(a => a.getName()), clips)
  assert.equal(decoded.listNodes().length, root.listNodes().length)
  assert.equal(decoded.listMeshes().length, root.listMeshes().length)
  assert.equal(decoded.listAccessors().length, accessorCount)
  const equal = (a, b, label) => {
    const x = a.getArray(), y = b.getArray()
    assert.ok(x.length === y.length && x.every((v,i) => v === y[i]), `${file}: ${label} changed`)
  }
  decoded.listMeshes().forEach((mesh, mi) => mesh.listPrimitives().forEach((p, pi) => {
    const original = root.listMeshes()[mi].listPrimitives()[pi]
    for (const semantic of p.listSemantics()) equal(p.getAttribute(semantic), original.getAttribute(semantic), semantic)
    if (p.getIndices()) {
      const x = p.getIndices().getArray(), y = original.getIndices().getArray()
      assert.equal(x.length, y.length)
      // Meshopt may rotate a triangle's first vertex without changing winding or shape.
      for (let i = 0; i < x.length; i += 3) {
        assert.ok([0,1,2].some(r => [0,1,2].every(k => x[i+k] === y[i+(k+r)%3])), `${file}: triangle changed`)
      }
    }
  }))
  decoded.listAnimations().forEach((clip, ci) => clip.listSamplers().forEach((sampler, si) => {
    const original = root.listAnimations()[ci].listSamplers()[si]
    equal(sampler.getInput(), original.getInput(), 'animation time')
    equal(sampler.getOutput(), original.getOutput(), 'animation values')
    assert.equal(sampler.getInterpolation(), original.getInterpolation())
  }))
  const before = (await fs.stat(input)).size
  const after = (await fs.stat(output)).size
  report.push({ file, before, after, reductionPercent: +(100 * (1 - after / before)).toFixed(2), animations: clips.length, verified: 'Full texture resolution; exact compressed quantized geometry; animation values, node and mesh counts retained' })
  console.log(file, before, '->', after)
}
await fs.mkdir('reports', { recursive: true })
await fs.writeFile('reports/model-optimization.json', JSON.stringify(report, null, 2))
