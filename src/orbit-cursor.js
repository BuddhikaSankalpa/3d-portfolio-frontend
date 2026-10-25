import './orbit-cursor.css'

// Purely decorative: OrbitControls and the existing marker buttons own input.
export function createOrbitCursor(canvas, controls) {
    const root = document.documentElement
    const cleanup = []
    let overlay
    let disposed = false
    let active = false
    let pointer = null
    let controlling = false
    let dragging = false
    let x = 0, y = 0
    let target = null
    const dispose = () => {
        disposed = true
        cleanup.forEach(remove => remove())
        root.classList.remove('orbit-cursor-active')
        overlay?.remove()
    }
    const listen = (object, type, handler, options) => {
        object.addEventListener(type, handler, options)
        cleanup.push(() => object.removeEventListener(type, handler, options))
    }
    try {
        const capable = matchMedia('(any-hover: hover) and (any-pointer: fine)')
        overlay = document.createElement('div')
        overlay.className = 'orbit-cursor'
        overlay.setAttribute('aria-hidden', 'true')
        overlay.innerHTML = `<span class="orbit-cursor-ring"><svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17"/><path class="orbit-cursor-arc" d="M18 1a17 17 0 0 1 14.72 8.5"/></svg></span><svg class="orbit-cursor-icons" viewBox="0 0 28 28" fill="none"><path class="orbit-cursor-ready" d="m9 11-3 3 3 3m10-6 3 3-3 3"/><path class="orbit-cursor-drag" d="M5 14h18M14 5v18m-6-12-3 3 3 3m12-6 3 3-3 3M11 8l3-3 3 3m-6 12 3 3 3-3"/></svg><span class="orbit-cursor-dot"></span>`
        document.body.append(overlay)
        // Fail open if the cursor stylesheet did not load.
        if (getComputedStyle(overlay).position !== 'fixed') throw new Error('Cursor CSS unavailable')
        const hide = () => {
            active = false
            pointer = null
            controlling = dragging = false
            root.classList.remove('orbit-cursor-active')
            overlay.classList.remove('is-visible')
        }
        const render = () => {
            if (disposed || !active) return
            const editable = target instanceof Element &&
                (target.closest('input, textarea') || target.isContentEditable)
            const interactive = target instanceof Element &&
                !target.closest('[inert], :disabled, [aria-disabled="true"]') &&
                target.closest('button, a[href], select, summary, [role="button"], [role="link"], [role="menuitem"]')
            const state = dragging ? 'dragging' : interactive ? 'interactive' :
                target === canvas && controls.enabled && controls.enableRotate ? 'ready' : 'default'
            overlay.dataset.state = state
            overlay.classList.toggle('is-visible', !editable)
            root.classList.toggle('orbit-cursor-active', !editable)
        }
        const track = event => {
            if (event.pointerType !== 'mouse' || !capable.matches) { hide(); return }
            x = event.clientX
            y = event.clientY
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { hide(); return }
            active = true
            target = event.target
            // No positional interpolation: the 4px dot always marks the true pointer.
            overlay.style.transform = `translate3d(${x}px, ${y}px, 0)`
            if (pointer && !event.buttons) pointer = null
            if (!pointer) dragging = false
            render()
        }
        const release = event => {
            if (pointer && event.pointerId !== pointer.id) return
            pointer = null
            controlling = dragging = false
            // Pointer capture can still target the canvas on release over a button.
            if (active) target = document.elementFromPoint(x, y)
            render()
        }
        listen(window, 'pointermove', track, { capture: true, passive: true })
        listen(window, 'pointerover', track, { passive: true })
        listen(window, 'pointerdown', event => {
            track(event)
            if (active && event.target === canvas && controls.enabled) {
                pointer = { id: event.pointerId, x, y }
            }
        }, { capture: true, passive: true })
        listen(controls, 'start', () => { controlling = !!pointer })
        listen(controls, 'change', () => {
            // A press alone (or wheel zoom) is not a drag. Require actual camera
            // interaction plus movement, without changing the controls' behavior.
            if (controlling && pointer && Math.hypot(x - pointer.x, y - pointer.y) >= 3) {
                dragging = true
                render()
            }
        })
        listen(controls, 'end', () => { controlling = dragging = false; render() })
        listen(window, 'pointerup', release, { capture: true, passive: true })
        listen(window, 'pointercancel', hide, { capture: true, passive: true })
        listen(canvas, 'lostpointercapture', release, { passive: true })
        listen(window, 'pointerout', event => { if (!event.relatedTarget) hide() }, { passive: true })
        listen(window, 'blur', hide)
        listen(window, 'pagehide', hide)
        listen(document, 'visibilitychange', () => { if (document.hidden) hide() })
        listen(capable, 'change', hide)
        return { dispose }
    } catch (error) {
        dispose()
        console.warn('Orbit cursor unavailable; using native cursor.', error)
        return { dispose() {} }
    }
}
