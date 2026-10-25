import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// A single authored orientation, matching the initial view. Never billboarded.
const orientation = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(new THREE.Vector3(5, 5, 5), new THREE.Vector3(), new THREE.Vector3(0, 1, 0))
)
const right = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation)
const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation)
const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(orientation)

export function createHero(parent, loadingManager) {
    const group = new THREE.Group()
    group.name = 'World-anchored portfolio typography'
    group.quaternion.copy(orientation)
    parent.add(group)
    const details = document.querySelector('.hero-details')
    const accessibleName = document.querySelector('#hero-name')
    const front = new THREE.MeshBasicMaterial({ color: '#edf6ff' })
    const sides = new THREE.MeshStandardMaterial({ color: '#168bff', roughness: 0.45, metalness: 0.15 })
    let textWidth = 6.5
    let ready = false
    let failed = false
    let viewport = { width: innerWidth, height: innerHeight }
    const projected = new THREE.Vector3()
    const viewNormal = new THREE.Vector3()
    const detailsAnchor = new THREE.Vector3(0, -1.65, 0)

    // Font and geometries are created once, with a visible HTML fallback only on failure.
    // Decode JSON in FileLoader so even a host's HTML fallback reaches onError.
    new THREE.FileLoader(loadingManager).setResponseType('json').load('/fonts/helvetiker_bold.typeface.json', data => {
        try {
            const font = new FontLoader().parse(data)
            for (const [index, word] of ['Buddhika', 'Sankalpa'].entries()) {
                const geometry = new TextGeometry(word, {
                    font, size: 1, depth: 0.035, curveSegments: 10,
                    bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2
                })
                geometry.computeBoundingBox()
                geometry.translate(-geometry.boundingBox.min.x, 0, 0)
                textWidth = Math.max(textWidth, geometry.boundingBox.max.x - geometry.boundingBox.min.x)
                const mesh = new THREE.Mesh(geometry, [front, sides])
                mesh.position.y = -index * 1.18
                group.add(mesh)
            }
            const title = new TextGeometry('W E L C O M E   T O   M Y   W O R L D', {
                font, size: 0.15, depth: 0.006, curveSegments: 4, bevelEnabled: false
            })
            const eyebrow = new THREE.Mesh(title, front)
            eyebrow.position.set(0.58, 1.55, 0)
            group.add(eyebrow)
            const rule = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.022, 0.01), sides)
            rule.position.set(0.18, 1.59, 0)
            group.add(rule)
            ready = true
            layout(viewport.width, viewport.height)
        } catch {
            showFallback()
        }
    }, undefined, showFallback)

    function showFallback() {
        failed = true
        group.visible = false
        group.children.forEach(mesh => mesh.geometry.dispose())
        group.clear()
        accessibleName.classList.replace('sr-only', 'hero-fallback')
        document.body.classList.add('hero-font-failed')
        details.style.visibility = 'visible'
        console.warn('Hero font unavailable; showing the accessible HTML heading instead.')
    }

    function layout(width, height) {
        viewport = { width, height }
        const stacked = width < 800 || width / height < 1.15
        const compact = stacked && height < 700
        const frameHeight = stacked ? Math.max(compact ? 4.2 : 3.4, 1.85 * height / width) : Math.max(1.95, 3.2 * height / width)
        const frameWidth = frameHeight * width / height
        const centerX = stacked ? 0 : -frameWidth * 0.19
        const centerY = stacked ? frameHeight * (compact ? 0.27 : 0.20) : 0
        const left = centerX - frameWidth / 2
        const top = centerY + frameHeight / 2
        const nameWidth = frameWidth * (stacked ? Math.min(0.84, 520 / width) : 0.37)
        group.scale.setScalar(nameWidth / textWidth)
        // Transform changes happen only when the responsive layout changes.
        const baseline = stacked ? top - frameHeight * (100 / height) - group.scale.x * 1.65 : frameHeight * 0.12
        group.position.copy(right).multiplyScalar(left + frameWidth * 0.055)
            .addScaledVector(up, baseline).addScaledVector(normal, 0.65)
        details.style.setProperty('--hero-width', `${width * (stacked ? 0.89 : 0.42)}px`)
        return { left, right: left + frameWidth, top, bottom: top - frameHeight }
    }

    function updateOverlay(camera) {
        if (!ready || failed) return
        group.updateWorldMatrix(true, false)
        projected.copy(detailsAnchor)
        group.localToWorld(projected).project(camera)
        viewNormal.copy(normal).transformDirection(camera.matrixWorldInverse)
        const visible = viewNormal.z > 0.94 && projected.z >= -1 && projected.z <= 1
            && projected.x > -1.1 && projected.x < 1 && projected.y > -1 && projected.y < 1
        details.style.visibility = visible ? 'visible' : 'hidden'
        details.inert = !visible
        details.style.transform = `translate(${(projected.x + 1) * viewport.width / 2}px, ${(1 - projected.y) * viewport.height / 2}px)`
    }

    function setTheme(light) {
        front.color.set(light ? '#193b60' : '#edf6ff')
        sides.color.set(light ? '#0066ff' : '#168bff')
    }
    return { layout, updateOverlay, setTheme }
}
