// Register immediately, but download only after the main island has painted.
export function createDeferredModels(concurrency = 2) {
    const queue = []
    let started = false
    let active = 0
    function pump() {
        while (started && active < concurrency && queue.length) {
            const { loader, url, onLoad, onProgress, onError } = queue.shift()
            active++
            const finish = () => { active--; pump() }
            const fail = error => {
                try { (onError ?? console.error)(error) } finally { finish() }
            }
            try {
                loader.load(url, gltf => {
                    try { onLoad(gltf) } catch (error) { console.error(`Could not initialize ${url}:`, error) }
                    finally { finish() }
                }, onProgress, fail)
            } catch (error) { fail(error) }
        }
    }
    return {
        load(loader, url, onLoad, onProgress, onError) {
            queue.push({ loader, url, onLoad, onProgress, onError })
            pump()
        },
        start() {
            if (started) return
            started = true
            pump()
        }
    }
}
