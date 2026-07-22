import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import firefliesVertexShader from './shaders/fireflies/vertex.glsl?raw'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl?raw'

import gsap from 'gsap'

// Canvas & Scene
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

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
const gltfLoader = new GLTFLoader()
const modelGroup = new THREE.Group()
scene.add(modelGroup)

gltfLoader.load(
    '/models/stylized_3d_floating_island_and_mine_house.glb', 
    (gltf) => {
        const room = gltf.scene
        
        room.position.set(0, -0.15, 0) 
        
        room.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material.map) {
                   child.material.map.colorSpace = THREE.SRGBColorSpace
                }
            }
        })
        
        modelGroup.add(room)

        // Model එක සම්පූර්ණයෙන් ලෝඩ් වූ පසු Points පෙන්වීමට sceneReady true කිරීම
        setTimeout(() => {
            sceneReady = true;
        }, 1000); 
    }
)


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
                popupOverlay.classList.remove('hidden');
                
                // සියලුම tabs අක්‍රිය කිරීම
                tabButtons.forEach(b => b.classList.remove('active'));
                contentSections.forEach(s => s.classList.remove('active'));

                // ක්ලික් කළ point එකට අදාල tab එක සක්‍රිය කිරීම
                const targetBtn = document.querySelector(`.tab-btn[data-target="${point.targetTab}"]`);
                if(targetBtn) targetBtn.classList.add('active');
                document.getElementById(point.targetTab).classList.add('active');
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
    const elapsedTime = clock.getElapsedTime()
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

// Menu විවෘත කිරීම
menuBtn.addEventListener('click', () => {
    popupOverlay.classList.remove('hidden');
});

// Menu වසා දැමීම සහ Zoom Out වීම
closeBtn.addEventListener('click', () => {
    popupOverlay.classList.add('hidden'); // Popup එක හංගන්න

    // 1. කැමරාව ආපහු මුල් Zoom අගයට (1) ගෙන ඒම
    gsap.to(camera, {
        zoom: 1, 
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => {
            camera.updateProjectionMatrix();
        }
    });

    // 2. කැමරාවේ Target එක ආපහු මුළු ගෙදරම පේන විදිහට මැදට (0,0,0) ගෙන ඒම
    gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
    });
});

// Theme මාරු කිරීම (Dark / Light) - Smooth Effect
themeBtn.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    
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

// Tabs අතර මාරු වීම
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Active styles ඉවත් කිරීම
        tabButtons.forEach(b => b.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));

        // ක්ලික් කළ Tab එක Active කිරීම
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});