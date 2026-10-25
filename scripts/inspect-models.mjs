import fs from 'node:fs/promises'

export function parseGLB(bytes) {
  const jsonLength = bytes.readUInt32LE(12)
  return { json: JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength)), bin: bytes.subarray(28 + jsonLength) }
}

const report = []
for (const file of (await fs.readdir('model-backups')).filter(name => name.endsWith('.glb'))) {
  const bytes = await fs.readFile(`model-backups/${file}`)
  const { json: j, bin } = parseGLB(bytes)
  const accessorBytes = indices => [...new Set(indices)].reduce((sum, i) => {
    const a = j.accessors[i]
    return sum + a.count * ({SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type]) * ({5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a.componentType])
  }, 0)
  const images = (j.images ?? []).map((image, index) => {
    const view = j.bufferViews[image.bufferView]
    const data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
    const usesTexture = (value, textureIndex) => value && typeof value === 'object' &&
      (value.index === textureIndex || Object.values(value).some(child => usesTexture(child, textureIndex)))
    const materials = (j.materials ?? []).filter(m => (j.textures ?? []).some((t, ti) => t.source === index && usesTexture(m, ti))).map(m => m.name)
    return { index, name: image.name, bytes: view.byteLength, width: image.mimeType === 'image/png' ? data.readUInt32BE(16) : null, height: image.mimeType === 'image/png' ? data.readUInt32BE(20) : null, materials }
  }).sort((a, b) => b.bytes - a.bytes)
  const meshes = (j.meshes ?? []).map(mesh => {
    const accessors = mesh.primitives.flatMap(p => [...Object.values(p.attributes), p.indices, ...(p.targets ?? []).flatMap(Object.values)]).filter(i => i !== undefined)
    return { name: mesh.name, bytes: accessorBytes(accessors), vertices: mesh.primitives.reduce((n,p) => n + j.accessors[p.attributes.POSITION].count, 0) }
  }).sort((a,b) => b.bytes - a.bytes)
  report.push({ file, bytes: bytes.length, textureBytes: images.reduce((n,i) => n + i.bytes, 0), images, meshes, animations: (j.animations ?? []).map(a => a.name) })
}
await fs.mkdir('reports', { recursive: true })
await fs.writeFile('reports/model-inspection.json', JSON.stringify(report, null, 2))
const island = report.find(m => m.file.startsWith('stylized'))
console.log(JSON.stringify({ bytes: island.bytes, textureBytes: island.textureBytes, largestImages: island.images.slice(0, 8), largestMeshes: island.meshes.slice(0, 8) }, null, 2))
