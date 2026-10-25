# Portfolio model optimization

Sizes are MiB (1,048,576 bytes), measured from actual GLB files. Original files are unchanged at `model-backups/*.glb`; runtime copies live in `public/models/optimized/`. Backups are outside public and are excluded from dist. All ten originals were SHA256-verified during relocation.

## Inspection

The island was 96,561,624 bytes (92.09 MiB): 48,019,260 bytes of embedded PNG textures (76 images), approximately 48.48 MB of geometry buffer data, and JSON/padding. All textures were inspected before choosing compression. The full per-image dimensions, material associations, and per-mesh accessor sizes are in `model-inspection.json`. Accessor byte sizes avoid incorrectly counting an entire shared bufferView once per mesh.

Largest individual texture payloads: grass 2,350,901 bytes; sack 1,935,122; island surface 1,448,739; tree leaf 1,326,379. These are 1024 x 1024 textures.

Largest individual mesh payloads: tree wood 4,432,980 bytes; windows 3,734,244 and 3,679,392; roof 3,688,332, 3,651,432, and 3,610,920. Several meshes share the same authored name.

## Selected compression

Quality-95 WebP with full-resolution textures and alpha quality 100; Meshopt compression with conservative 16-bit position, normal, UV and skin-weight quantization. UVs outside [0,1] stay unquantized. No triangle decimation or animation clip removal. This is visually close, not mathematically lossless. A lossless trial left the island at 62.93 MiB and was replaced by this smaller version.

Both GLTFLoaders use Three.js's bundled MeshoptDecoder, so there is no external decoder CDN request. WebP uses the browser's native image decoder. The existing rabbit/host legacy material compatibility handles empty PBR objects emitted by the optimizer.

## Sizes

| Model | Before MiB | After MiB | Reduction |
|---|---:|---:|---:|
| `animated_dog_shiba_inu.glb` | 9.63 | 3.21 | 66.67% |
| `an_animated_cat.glb` | 3.03 | 0.74 | 75.49% |
| `a_rock.glb` | 4.31 | 1.06 | 75.42% |
| `baloon_ship_2.glb` | 9.12 | 2.01 | 77.96% |
| `butterflies.glb` | 6.08 | 1.43 | 76.41% |
| `duck_animation.glb` | 4.23 | 1.01 | 76.09% |
| `horse.glb` | 18.88 | 6.34 | 66.40% |
| `rabbit_realistic.glb` | 2.60 | 0.87 | 66.75% |
| `stylized_3d_floating_island_and_mine_house.glb` | 92.09 | 24.02 | 73.92% |
| `waving.glb` | 3.57 | 0.98 | 72.60% |

Total: 153.53 -> 41.67 MiB (72.86% smaller). Secondary models: 61.44 -> 17.65 MiB. Initial model download: 153.53 -> 24.02 MiB (84.35% less), because only the island is requested initially. This excludes JS, CSS and the font.

## Loading

The canvas is revealed immediately after the island's first render. The secondary queue starts after a browser frame plus 800 ms and permits two loads at a time. Failures do not block later queue entries. All placements, marker handlers, orbit controls, mixer updates, balloon flight and floating-rock motion remain active.

## Verification

- After backup relocation, dist was checked recursively: exactly ten GLBs, all under models/optimized, totaling 41.67 MiB, with SHA-256 hashes matching the runtime source files. No original GLBs remain in public or dist.
- Production build passed; Vite still warns about the main JavaScript chunk exceeding 500 kB.
- Optimizer reloads every output and checks decoded quantized attributes, triangle winding/topology, animation values/interpolation, mesh and node counts.
- Browser test: all ten assets decode without console errors; all seven mixers advance; five numbered markers appear; orbit drag, marker popup, Escape/control restoration, theme and menu pass.
- Resource timing confirms all nine secondary requests start after `island-visible`. Local timing is not a prediction of deployed network performance.
- Queue test verifies no early requests, concurrency limit, idempotent start, and recovery from a failed asset.
- Matching original/optimized front and back screenshots use frozen animation time and hidden random fireflies. Full-frame PSNR: 50.14 dB front, 51.63 dB back. Screenshots were visually inspected; no visible silhouette or material regression was found at the tested views. These metrics include the unchanged page background.

## Reproduce

`npm run models:inspect`, then `npm run models:optimize`, then `npm run build`.

`npm run test:loading` checks the scheduler. Start Vite, set PORTFOLIO_URL to its URL (browser scripts default to http://127.0.0.1:5174/), then run `npm run test:portfolio` and `npm run test:appearance`. Browser tests use installed Google Chrome. The appearance test redirects original-model requests to a temporary loopback-only server that streams files from model-backups. The server exists only for the test and closes afterward; Vite and the production build use only optimized models.
