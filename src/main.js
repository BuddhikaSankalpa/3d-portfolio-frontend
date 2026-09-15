import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import firefliesVertexShader from './shaders/fireflies/vertex.glsl?raw'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl?raw'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

import gsap from 'gsap'

// Canvas & Scene
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Loading Manager (ඔක්කොම load වෙනකන් canvas එක hide කරලා තියලා, ඉවර උනාට පස්සෙ fade-in කිරීමට)
 */
const loadingManager = new THREE.LoadingManager(
    () => {
        // Model, texture, font ඔක්කොම load වුනාට පස්සෙ canvas එක fade-in කිරීම
        canvas.classList.add('loaded')
    }
)

/**
 * Lights (ආලෝකය)
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(5, 5, 5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
scene.add(directionalLight)

let sceneReady = false; // Points හැංගීමට

/**
 * Model Load කිරීම
 */
const gltfLoader = new GLTFLoader(loadingManager)
const modelGroup = new THREE.Group()
scene.add(modelGroup)

// 👇 FIX: Console log එකෙන් හම්බුණ "Final_Bridge1_SF_Bridge_Mat_0" සහ
// "Final_Bridge1_SF_Rail_Mat_0" කියන mesh දෙක තමයි pink/cream diagonal
// stripes එකට හේතුව (දිග bridge/rail geometry එකක් island එකෙන් එහාට extend වෙනවා).
// ඒ නමට match වෙන meshes traverse එකේදීම hide කරලා දානවා.
const HIDDEN_MESH_KEYWORDS = ['Bridge_Mat', 'Rail_Mat']

gltfLoader.load(
    '/models/stylized_3d_floating_island_and_mine_house.glb', 
    (gltf) => {
        const room = gltf.scene
        room.position.set(0, -0.15, 0) 
        
        room.traverse((child) => {
            if (child.isMesh) {
                console.log('Mesh name:', child.name, '| Material:', child.material.name)

                // 👇 FIX: Bridge/Rail mesh එක නම, render කරන්නම එපා
                const isUnwantedMesh = HIDDEN_MESH_KEYWORDS.some((keyword) =>
                    child.name.includes(keyword) || child.material?.name?.includes(keyword)
                )
                if (isUnwantedMesh) {
                    child.visible = false
                    return
                }

                child.castShadow = true
                child.receiveShadow = true
                if (child.material.map) {
                   child.material.map.colorSpace = THREE.SRGBColorSpace
                }
            }
        })
        
        modelGroup.add(room)
        setTimeout(() => { sceneReady = true }, 1000)
    }
)

/**
 * Yard companion. Placement uses the island's local coordinates so the dog
 * stays attached to the yard during parallax and camera movement.
 */
const dogPlacement = {
    height: 0.13,
    position: new THREE.Vector3(0.38, -0.152, 0.00),
    rotationY: Math.PI / 5
}
let dogMixer = null

gltfLoader.load('/models/animated_dog_shiba_inu.glb', (gltf) => {
    const dog = gltf.scene
    const anchor = new THREE.Group()
    anchor.name = 'Yard Shiba Inu'
    anchor.position.copy(dogPlacement.position)
    anchor.rotation.y = dogPlacement.rotationY

    dog.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true
            // Avoid self-shadow artifacts on the small animated fur mesh.
            child.receiveShadow = false
            // Animated limbs can move outside the original mesh bounds.
            child.frustumCulled = false
        }
        if (child.isLight || child.isCamera) child.visible = false
    })

    const sittingClip = gltf.animations.find(clip => /sitting/i.test(clip.name))
        ?? gltf.animations[0]
    if (sittingClip) {
        dogMixer = new THREE.AnimationMixer(dog)
        dogMixer.clipAction(sittingClip).play()
        dogMixer.update(0)
    }

    // Normalize the authored model size, then align its paws with the yard.
    dog.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(dog)
    const scale = dogPlacement.height / bounds.getSize(new THREE.Vector3()).y
    const center = bounds.getCenter(new THREE.Vector3())
    dog.scale.multiplyScalar(scale)
    dog.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    anchor.add(dog)
    modelGroup.add(anchor)
}, undefined, (error) => {
    console.error('Could not load the yard Shiba Inu:', error)
})

/** Waving host on the open lawn to the left of the front steps. */
const wavingPlacement = {
    height: 0.24,
    position: new THREE.Vector3(-0.15, -0.1662, 0.30),
    rotationY: Math.PI / 4
}
let wavingMixer = null

// Convert this asset's legacy specular/glossiness material to the supported
// metallic/roughness workflow while retaining its embedded color texture.
const wavingLoader = new GLTFLoader(loadingManager)
wavingLoader.register(parser => ({
    name: 'YardLegacyMaterialCompatibility',
    beforeRoot() {
        for (const material of parser.json.materials ?? []) {
            const legacy = material.extensions?.KHR_materials_pbrSpecularGlossiness
            if (!legacy || material.pbrMetallicRoughness) continue
            material.pbrMetallicRoughness = {
                baseColorFactor: legacy.diffuseFactor ?? [1, 1, 1, 1],
                baseColorTexture: legacy.diffuseTexture,
                metallicFactor: 0,
                roughnessFactor: 1 - (legacy.glossinessFactor ?? 0)
            }
        }
    }
}))
wavingLoader.load('/models/waving.glb', (gltf) => {
    const character = gltf.scene
    const anchor = new THREE.Group()
    anchor.name = 'Waving yard host'
    anchor.position.copy(wavingPlacement.position)
    anchor.rotation.y = wavingPlacement.rotationY

    character.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = false
            child.frustumCulled = false
        }
        if (child.isLight || child.isCamera) child.visible = false
    })

    // This file contains one Mixamo waving clip.
    const waveClip = gltf.animations.find(clip => /wav/i.test(clip.name))
        ?? gltf.animations[0]
    if (waveClip) {
        wavingMixer = new THREE.AnimationMixer(character)
        wavingMixer.clipAction(waveClip).play()
        wavingMixer.update(0)
    }

    character.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(character)
    const scale = wavingPlacement.height / bounds.getSize(new THREE.Vector3()).y
    const center = bounds.getCenter(new THREE.Vector3())
    // Keep scaling and ground alignment outside the animated model hierarchy.
    const fit = new THREE.Group()
    fit.scale.setScalar(scale)
    fit.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    fit.add(character)
    anchor.add(fit)
    modelGroup.add(anchor)
}, undefined, (error) => {
    console.error('Could not load the waving yard character:', error)
})

/**
 * Airplane Model Load කිරීම
 */
let airplane = null; // Animation සඳහා variable එකක්

gltfLoader.load(
    '/models/baloon_ship_2.glb', // ඔයාගේ ෆයිල් එකේ නම මෙතනට දෙන්න
    (gltf) => {
        airplane = gltf.scene;
        
        // Model එකේ සයිස් එක ගෙදරට ගැලපෙන විදිහට අඩු/වැඩි කරන්න
        airplane.scale.set(0.05, 0.05, 0.05); 
        
        // ආරම්භක පිහිටීම (උඩින් තියන්න)
        airplane.position.set(0, 1.5, 0); 
        
        airplane.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material.map) {
                   child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
            }
        });
        
        // Parallax effect එකටත් අහුවෙන්න modelGroup එකටම add කරමු
        modelGroup.add(airplane); 
    }
);

/**
 * Potion Brewer Island Model Load කිරීම
 */
let potionIsland = null;
let rock2 = null;
let rock3 = null;
let rock4 = null;
let rock5 = null;

// 👇 FIX: rock2-rock5 clones ටිකත් tick() එකේදී loop කරලා animate කරන්න
// පුළුවන් වෙන්න array එකකට දාගන්නවා (කලින් potionIsland එකට විතරයි animation තිබුණේ)
const floatingRocks = []

gltfLoader.load(
    '/models/a_rock.glb', // ඔයාගේ අලුත් ෆයිල් එකේ නම
    (gltf) => {
        potionIsland = gltf.scene;
        
        // Size එක
        potionIsland.scale.set(0.00099, 0.00099, 0.00099);   
        // Position එක (සුදු කොටුව තිබුණු හරිය)
        potionIsland.position.set(-1.0, 10, 1.0); 
        // දූපත ටිකක් හැරවීම
        potionIsland.rotation.y = Math.PI / 4; 

        potionIsland.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material.map) {
                   child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
            }
        });
        
        // Model Group එකට එකතු කිරීම
        modelGroup.add(potionIsland); 
        floatingRocks.push({ mesh: potionIsland, baseY: -0.2, speed: 1.2, amp: 0.05 }) // 👈 FIX: array එකට එකතු කිරීම

        // --- දෙවැනි ගල එකතු කිරීම (Clone කිරීම) ------------------------------------------------

        // Clone කිරීමෙන් load වුණු model එකේම තවත් පිටපතක් හැදේ
        rock2 = potionIsland.clone(); 
        
        // දකුණු පසින් (X ධන අගයක්) සහ දුරින් (Z සෘණ අගයක්) පිහිටුවීම
        // ඔයාට අවශ්‍ය විදිහට මේ අගයන් වෙනස් කරගන්න (X, Y, Z)
        rock2.position.set(0, -1, -1.5); 
        
        // දෙවැනි ගලේ පෙනුම ස්වභාවික කරන්න ටිකක් වෙනස් අතකට හරවමු
        rock2.rotation.y = Math.PI / 1.5; 
        rock2.rotation.z = Math.PI / 8; // ලාවට ඇල කිරීම
        
        // අවශ්‍ය නම් දෙවැනි ගලේ සයිස් එකත් වෙනස් කරන්න පුළුවන්
        rock2.scale.set(0.0007, 0.0007, 0.0007); 
        
        // Model Group එකට එකතු කිරීම
        modelGroup.add(rock2); 
        floatingRocks.push({ mesh: rock2, baseY: -1, speed: 1.0, amp: 0.04 }) // 👈 FIX: array එකට එකතු කිරීම

        // --- තෙවැනි ගල එකතු කිරීම (Clone කිරීම) ------------------------------------------------
        rock3 = potionIsland.clone();
        
        // තෙවැනි ගලේ පිහිටීම (X, Y, Z) වෙනස් කරන්න
        rock3.position.set(1.2, -0.5, 0.5);
        
        // තෙවැනි ගලේ rotation වෙනස් කිරීම
        rock3.rotation.y = Math.PI / 3; 
        rock3.rotation.z = -Math.PI / 10;
        
        // තෙවැනි ගලේ සයිස් එක වෙනස් කිරීම
        rock3.scale.set(0.0006, 0.0006, 0.0006);
        
        // Model Group එකට එකතු කිරීම
        modelGroup.add(rock3);
        floatingRocks.push({ mesh: rock3, baseY: -0.5, speed: 1.4, amp: 0.05 }) // 👈 FIX: array එකට එකතු කිරීම

        // --- හතරවැනි ගල එකතු කිරීම (Clone කිරීම) ------------------------------------------------
        rock4 = potionIsland.clone();
        
        // හතරවැනි ගලේ පිහිටීම (X, Y, Z) වෙනස් කරන්න
        rock4.position.set(-1.5, -0.8, -0.5);
        
        // හතරවැනි ගලේ rotation වෙනස් කිරීම
        rock4.rotation.y = -Math.PI / 2; 
        rock4.rotation.z = Math.PI / 12;
        
        // හතරවැනි ගලේ සයිස් එක වෙනස් කිරීම
        rock4.scale.set(0.0005, 0.0005, 0.0005);
        
        // Model Group එකට එකතු කිරීම
        modelGroup.add(rock4);
        floatingRocks.push({ mesh: rock4, baseY: -0.8, speed: 0.9, amp: 0.06 }) // 👈 FIX: array එකට එකතු කිරීම

        // --- පස්වැනි ගල එකතු කිරීම (Clone කිරීම) ------------------------------------------------
        rock5 = potionIsland.clone();

        // පස්වැනි ගලේ පිහිටීම (X, Y, Z) වෙනස් කරන්න
        rock5.position.set(0.8, -1.2, -1.2);

        // පස්වැනි ගලේ rotation වෙනස් කිරීම
        rock5.rotation.y = Math.PI / 6; 
        rock5.rotation.z = -Math.PI / 15;

        // පස්වැනි ගලේ සයිස් එක වෙනස් කිරීම
        rock5.scale.set(0.0004, 0.0004, 0.0004);

        // Model Group එකට එකතු කිරීම
        modelGroup.add(rock5);
        floatingRocks.push({ mesh: rock5, baseY: -1.2, speed: 1.1, amp: 0.045 }) // 👈 FIX: array එකට එකතු කිරීම
    }
);

/**
 * 3D Text (ඔයාගේ නම) එකතු කිරීම
 */
// const textureLoader = new THREE.TextureLoader(loadingManager)
// const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
// matcapTexture.colorSpace = THREE.SRGBColorSpace 

// const fontLoader = new FontLoader(loadingManager)

// // 👇 මෙතන Path එක ඔයාගේ ෆෝල්ඩරයට ගැලපෙන විදිහට '/fonts/...' ලෙස වෙනස් කර ඇත
// fontLoader.load(
//     '/fonts/helvetiker_regular.typeface.json',
//     (font) => {
//         const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

//         const textGeometry = new TextGeometry(
//             'BUDDHIKA SANKALPA',
//             {
//                 font: font,
//                 size: 0.4,
//                 height: 0.08,
//                 curveSegments: 12,
//                 bevelEnabled: true,
//                 bevelThickness: 0.03,
//                 bevelSize: 0.02,
//                 bevelOffset: 0,
//                 bevelSegments: 5
//             }
//         )
        
//         textGeometry.center()
//         textGeometry.computeVertexNormals()

//         const textMesh = new THREE.Mesh(textGeometry, textMaterial)

//         // Scale එක සහ Position එක ගෙදරට උඩින් පිහිටුවීම
//         textMesh.scale.set(0.15, 0.15, 0.15)
//         textMesh.position.set(0, 1.3, -0.3) 

//         // කැමරාවට මුහුණලා පේන්න හැරවීම
//         textMesh.rotation.y = Math.PI / 4 
//         textMesh.rotation.x = -Math.PI / 10 
        
//         textMesh.castShadow = true

//         modelGroup.add(textMesh)
//     },
//     undefined,
//     (error) => {
//         console.error('Font load වීමේ දෝෂයක්:', error)
//     }
// )



/**
 * Points of Interest (Hotspots)
 */
const raycaster = new THREE.Raycaster()

// Points 5 හි අගයන් Island එකට ළං වන ලෙස කුඩා කර ඇත
const points = [
    {
        position: new THREE.Vector3(-0.4, -0.4, 0.0), // 1. වම් පස කොටස (පාලම දෙසට)
        element: document.querySelector('.point-0'),
        targetTab: 'about'
    },
    {
        position: new THREE.Vector3(-0.4, 0, 0), // 2. ගෙදර වහලය හරියේ
        element: document.querySelector('.point-1'),
        targetTab: 'skills'
    },
    {
        position: new THREE.Vector3(0.4, 0.1, 0.0), // 3. ඉදිරිපස මිදුල හරියේ
        element: document.querySelector('.point-2'),
        targetTab: 'experience'
    },
    {
        position: new THREE.Vector3(0.2, 0, -0.6), // 4. පිටුපස ගස් හරියේ
        element: document.querySelector('.point-3'),
        targetTab: 'awards'
    },
    {
        position: new THREE.Vector3(0.3, -0.5, -0.4), // 5. පල්ලෙහා ගල් කොටස
        element: document.querySelector('.point-4'),
        targetTab: 'contact'
    }
]

// Point එකක් ක්ලික් කළ විට Zoom වීම සහ Popup එක විවෘත වීම
points.forEach((point) => {
    point.element.querySelector('.label').addEventListener('click', () => {
        const targetPos = point.position;
        
        // 1. Controls වල Target එක අදාල Point එක දෙසට හැරවීම (Pan වීම)
        gsap.to(controls.target, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1.5,
            ease: 'power3.inOut'
        });

        // 2. Orthographic කැමරාවේ Zoom අගය වැඩි කිරීම
        gsap.to(camera, {
            zoom: 3.5, // 3.5 ගුණයකින් විශාල කිරීම
            duration: 1.5,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.updateProjectionMatrix(); // Zoom වෙනස් වන විට අනිවාර්යයෙන්ම Update කළ යුතුයි
            },
            // 👇 Zoom Animation එක සම්පූර්ණයෙන්ම අවසන් වූ පසු මෙය ක්‍රියාත්මක වේ 👇
            onComplete: () => {
                // 3. අදාල Popup Section එක විවෘත කිරීම
                openPopup(point.targetTab, point.element.querySelector('.label'));
            }
        });
    });
});

/**
 * Fireflies (කණාමැදිරියෝ)
 */
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 200 // කණාමැදිරියෝ ගණන ටිකක් වැඩි කළා
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for(let i = 0; i < firefliesCount; i++)
{
    const angle = Math.random() * Math.PI * 2; 
    
    // කලින් තිබුණ 8 වෙනුවට 0.5 ත්, 10 වෙනුවට 1.5 ත් වගේ කුඩා අගයන් දෙන්න
    const radius = 0.5 + Math.random() * 1.5; 

    positionArray[i * 3 + 0] = Math.cos(angle) * radius; 
    
    // උඩට සහ පහළට යන ප්‍රමාණය (Y අක්ෂය) අඩු කරන්න
    positionArray[i * 3 + 1] = (Math.random() - 0.5) * 2; 
    
    positionArray[i * 3 + 2] = Math.sin(angle) * radius; 

    scaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 200 } // Size එක ටිකක් වැඩි කළා පැහැදිලිව පේන්න
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending, // අඳුරේ දිළිසෙන පෙනුම ලබාදීමට
    depthWrite: false
})

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)


/**
 * Sizes & Camera
 */
const sizes = { width: window.innerWidth, height: window.innerHeight }

const frustumSize = 1.65 // Model එකේ සයිස් එක අනුව මේක අඩු/වැඩි කරන්න
const aspect = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000
)
camera.position.set(5, 5, 5)
scene.add(camera)

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    
    camera.left = frustumSize * camera.aspect / -2
    camera.right = frustumSize * camera.aspect / 2
    camera.top = frustumSize / 2
    camera.bottom = frustumSize / -2
    camera.updateProjectionMatrix()
    
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Controls (360° කරකැවීම සඳහා)
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true 
controls.enableZoom = true 
controls.target.set(0, 0, 0)
controls.minZoom = 0.8 
controls.maxZoom = 5.0 // <--- මේ අගය 3.0 සිට 5.0 ට වෙනස් කරන්න
// controls.minAzimuthAngle = 0; 
// controls.maxAzimuthAngle = Math.PI / 2;

/**
 * Mouse Move (Parallax Motion Effect එක සඳහා)
 */
const cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (event) => {
    // මවුස් එකේ පිහිටීම -0.5 සහ 0.5 අතර අගයකට සකසා ගැනීම
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.useLegacyLights = false
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.25
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap // Warning එක නැති කරන්න PCFShadowMap යෙදුවා

/**
 * Animate (Tick Function)
 */
const clock = new THREE.Clock()

const tick = () => {
    const deltaTime = clock.getDelta()
    const elapsedTime = clock.elapsedTime
    if (dogMixer) dogMixer.update(Math.min(deltaTime, 0.05))
    if (wavingMixer) wavingMixer.update(Math.min(deltaTime, 0.05))
    firefliesMaterial.uniforms.uTime.value = elapsedTime

    // Parallax Effect
    const parallaxX = - cursor.x * 0.2
    const parallaxY = cursor.y * 0.2
    modelGroup.position.x += (parallaxX - modelGroup.position.x) * 0.05
    modelGroup.position.y += (parallaxY - modelGroup.position.y) * 0.05


    // --- Airplane Animation ---
    if (airplane) {
        const speed = -elapsedTime * 0.5; // කැරකෙන වේගය
        const radius = 1.0; // ගෙදර ඉඳන් තියෙන දුර (රවුමේ අරය)

        // රවුමට ගමන් කරවීම (X සහ Z අක්ෂ ඔස්සේ)
        airplane.position.x = Math.cos(speed) * radius;
        airplane.position.z = Math.sin(speed) * radius;

        // උඩ පහළ යන ගතියක් ලබා දීම (Y අක්ෂය)
        airplane.position.y = 0.0 + Math.sin(elapsedTime * 2) * 0.1;

        // යන දිශාවටම මුහුණලා (Rotate වී) ගමන් කිරීමට සැලැස්වීම
        // ඔයාගේ Model එක load වෙද්දී තියෙන දිශාව අනුව Math.PI අගය වෙනස් කරන්න වෙන්න පුළුවන්
        airplane.rotation.y = -speed + Math.PI; 
        
        // ගුවන් යානය හැරෙනකොට පොඩ්ඩක් ඇලවෙන (Bank) ස්වභාවයක් එකතු කරන්න
        airplane.rotation.z = Math.sin(elapsedTime * 2) * 0.1;
    }

    // --- Potion Brewer Island Floating Animation ---
    // 👇 FIX: potionIsland විතරක් නෙවෙයි, floatingRocks array එකේ ඉන්න
    // rock2-rock5 clones ටිකත් ඔක්කොම වෙන වෙනම float කරන්න loop කරනවා
    floatingRocks.forEach((rock) => {
        rock.mesh.position.y = rock.baseY + Math.sin(elapsedTime * rock.speed) * rock.amp
    })

    controls.update() 

    // --- Points Update (බාධක වලින් හැංගෙන එක අයින් කර ඇත) ---
    if(sceneReady) {
        for(const point of points) {
            // Point එකේ ලෝක ඛණ්ඩාංක (World Position) ලබා ගැනීම
            const pointWorldPosition = point.position.clone()
            pointWorldPosition.add(modelGroup.position) 

            // තිරයේ පිහිටීම (Screen Position) ලබා ගැනීම
            const screenPosition = pointWorldPosition.clone()
            screenPosition.project(camera)
    
            // Raycaster බාධක චෙක් කිරීම ඉවත් කර, කෙලින්ම පෙන්වීමට සැකසීම
            point.element.classList.add('visible')
    
            // HTML Element එක තිරයේ ස්ථානගත කිරීම
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }
    // ----------------------------------------------

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()




/**
 * UI Interactions
 */
const menuBtn = document.getElementById('menu-btn');
const themeBtn = document.getElementById('theme-btn');
const closeBtn = document.getElementById('close-btn');
const popupOverlay = document.getElementById('info-popup');
const tabButtons = document.querySelectorAll('.tab-btn');
const contentSections = document.querySelectorAll('.content-section');

let popupTrigger = menuBtn;
const popupContainer = document.querySelector('.popup-container');
const popupContent = document.querySelector('.popup-content');
function selectTab(targetId, focus = false) {
    tabButtons.forEach(button => {
        const active = button.dataset.target === targetId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) {
            button.focus();
            button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });
    contentSections.forEach(section => {
        const active = section.id === targetId;
        section.classList.toggle('active', active);
        section.hidden = !active;
    });
    popupContent.scrollTop = 0;
}
function openPopup(targetId = document.querySelector('.tab-btn.active').dataset.target, trigger = menuBtn) {
    popupTrigger = trigger;
    popupOverlay.classList.remove('hidden');
    popupOverlay.inert = false;
    controls.enabled = false;
    selectTab(targetId, true);
}
function closePopup() {
    popupOverlay.classList.add('hidden');
    popupOverlay.inert = true;
    controls.enabled = true;
    popupTrigger.focus();
    gsap.to(camera, { zoom: 1, duration: 1.5, ease: 'power3.inOut', overwrite: true,
        onUpdate: () => camera.updateProjectionMatrix() });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', overwrite: true });
}
menuBtn.addEventListener('click', () => openPopup());
closeBtn.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', event => { if (event.target === popupOverlay) closePopup(); });
document.addEventListener('keydown', event => {
    if (popupOverlay.classList.contains('hidden')) return;
    if (event.key === 'Escape') closePopup();
    if (event.key === 'Tab') {
        const focusable = [...popupContainer.querySelectorAll('button, a[href], [tabindex="0"]')]
            .filter(element => element.tabIndex >= 0 && element.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
});
document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', () => selectTab(button.dataset.section, true));
});

// Theme මාරු කිරීම (Dark / Light) - Smooth Effect
themeBtn.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    themeBtn.setAttribute('aria-pressed', String(isLightMode));
    
    if (isLightMode) {
        // 1. තරු ටික smooth විදිහට කුඩා වී මැකී යාම (Size එක 0 කිරීම)
        gsap.to(firefliesMaterial.uniforms.uSize, { value: 0, duration: 1, ease: 'power2.inOut' });
        
        // 2. දවල් කාලය වගේ පේන්න Model එකේ ආලෝකය smooth ලෙස වැඩි කිරීම
        gsap.to(ambientLight, { intensity: 2.5, duration: 1, ease: 'power2.inOut' });
        gsap.to(directionalLight, { intensity: 3, duration: 1, ease: 'power2.inOut' });
    } else {
        // 1. Dark mode එකේදී තරු ටික නැවත smooth විදිහට විශාල වීම
        gsap.to(firefliesMaterial.uniforms.uSize, { value: 200, duration: 1, ease: 'power2.inOut' });
        
        // 2. රාත්‍රිය වගේ පේන්න ආලෝකය නැවත මුල් තත්වයටම අඩු කිරීම
        gsap.to(ambientLight, { intensity: 1, duration: 1, ease: 'power2.inOut' });
        gsap.to(directionalLight, { intensity: 1.5, duration: 1, ease: 'power2.inOut' });
    }
});

// Accessible tab navigation.
tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(button.dataset.target));
    button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabButtons.length) % tabButtons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabButtons.length - 1;
        if (next !== undefined) { event.preventDefault(); selectTab(tabButtons[next].dataset.target, true); }
    });
});
