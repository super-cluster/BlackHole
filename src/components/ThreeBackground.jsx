import { useEffect, useRef } from 'react'
import './ThreeBackground.css'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Asteroid Vertex Shader (adds procedural noise displacement to make rocks)
// ─────────────────────────────────────────────────────────────────────────────
const ASTEROID_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Simple 3D noise
  float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7, 74.7)))*43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    // Displace vertices to make jagged rocks
    float n = noise(position * 0.4);
    vec3 pos = position + normal * (n * 3.5);

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`
const ASTEROID_FRAG = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  uniform vec3 uColor;
  uniform vec3 uRimColor;
  uniform vec3 uLightDir;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightDir);
    
    // Diffuse lighting
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Rim lighting (cinematic backlighting)
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = smoothstep(0.6, 1.0, rim);
    
    // Combine
    vec3 finalColor = uColor * (diff * 0.4 + 0.05); // dark rock base
    finalColor += uRimColor * rim * 0.8 * max(dot(normal, lightDir), 0.0);
    
    // Atmospheric depth fade (handled by Three.js fog if we used built-in materials, 
    // but here we manually approximate deep space fade for custom shader)
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep(500.0, 3000.0, depth);
    finalColor = mix(finalColor, vec3(0.0, 0.0, 0.02), fogFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Nebula Shader (Procedural cosmic gas clouds)
// ─────────────────────────────────────────────────────────────────────────────
const NEBULA_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const NEBULA_FRAG = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p),f=fract(p);
    f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.0+vec2(0.4,0.7); a*=0.5; }
    return v;
  }

  void main() {
    // Zoom out the procedural clouds significantly for immense cosmic scale
    vec2 uv = vUv * 35.0;
    // Domain warping for realistic wispy clouds
    vec2 q = vec2(fbm(uv + uTime * 0.005), fbm(uv + vec2(1.0)));
    vec2 r = vec2(fbm(uv + 1.0*q + vec2(1.7,9.2) + 0.01*uTime), 
                  fbm(uv + 1.0*q + vec2(8.3,2.8) + 0.008*uTime));
    float f = fbm(uv + r);

    // Midnight Solar palette — deep navy + gold sun shimmer
    vec3 color = mix(vec3(0.0), vec3(0.01, 0.04, 0.12), clamp(f*f*3.0, 0.0, 1.0)); // Deep midnight blue
    color = mix(color, vec3(0.00, 0.06, 0.18), clamp(length(q), 0.0, 1.0));         // Cobalt blue
    color = mix(color, vec3(0.08, 0.05, 0.01), clamp(length(r.x), 0.0, 1.0));       // Warm sun gold tint

    // Highlight densest cloud cores with gold-blue shimmer
    color += vec3(0.10, 0.14, 0.22) * smoothstep(0.4, 0.8, f);  // Blue highlights
    color += vec3(0.08, 0.06, 0.01) * smoothstep(0.6, 0.9, f);  // Gold core

    // Set density and opacity for additive blending
    float alpha = smoothstep(0.1, 0.9, f);
    gl_FragColor = vec4(color * f * 1.5, alpha * 1.5);
  }
`

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x00020f, 0.00015)

    const camera = new THREE.PerspectiveCamera(45, W / H, 1, 10000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1)
    rimLight.position.set(-10, 10, 10)
    scene.add(rimLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    const nebulaUni = { uTime: { value: 0 } }
    const nebulaGeo = new THREE.PlaneGeometry(15000, 15000)
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: nebulaUni,
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat)
    nebulaMesh.position.z = -5000
    scene.add(nebulaMesh)

    // ── VOLUMETRIC 3D GALAXIES (Procedural Particle Systems) ──────────────
    const galaxies = []
    function createGalaxy(opts) {
      const { count, size, radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor } = opts
      
      const group = new THREE.Group()
      
      // 1. Galaxy Particles
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const scales = new Float32Array(count)

      const colIn = new THREE.Color(insideColor)
      const colOut = new THREE.Color(outsideColor)

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const r = Math.random() * radius
        const spinAngle = r * spin
        const branchAngle = ((i % branches) / branches) * Math.PI * 2

        // Clustered randomness for organic shapes
        const rx = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r
        const ry = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r
        const rz = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r

        positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx
        positions[i3 + 1] = ry
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz

        const mixed = colIn.clone().lerp(colOut, r / radius)
        colors[i3] = mixed.r
        colors[i3 + 1] = mixed.g
        colors[i3 + 2] = mixed.b

        scales[i] = Math.random()
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
      geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

      const mat = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float aScale;
          attribute vec3 aColor;
          varying vec3 vMyColor;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = (${size.toFixed(1)} * aScale * 1000.0) / -mvPosition.z;
            vMyColor = aColor;
          }
        `,
        fragmentShader: `
          varying vec3 vMyColor;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if(d > 0.5) discard;
            float strength = pow(1.0 - (d * 2.0), 2.5); // Soft glowing star
            gl_FragColor = vec4(vMyColor, strength);
          }
        `
      })
      const mesh = new THREE.Points(geo, mat)
      group.add(mesh)
      
      // 2. Core Glow Background Sprite
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      
      const r_c = Math.floor(colIn.r * 255)
      const g_c = Math.floor(colIn.g * 255)
      const b_c = Math.floor(colIn.b * 255)
      
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, `rgba(${r_c}, ${g_c}, ${b_c}, 0.8)`)
      gradient.addColorStop(0.2, `rgba(${r_c}, ${g_c}, ${b_c}, 0.3)`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)
      
      const glowTex = new THREE.CanvasTexture(canvas)
      const glowMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.9
      })
      const glowSprite = new THREE.Sprite(glowMat)
      glowSprite.scale.set(radius * 4.5, radius * 4.5, 1)
      group.add(glowSprite)

      scene.add(group)
      galaxies.push(group)
      return group
    }

    // Milky Way style spiral
    const galaxy1 = createGalaxy({
      count: 40000, size: 25.0, radius: 1200, branches: 3, spin: 0.0015,
      randomness: 0.4, randomnessPower: 2.5,
      insideColor: 0xffddaa, outsideColor: 0x00c8ff
    })
    galaxy1.position.set(2200, 1200, -3800)
    galaxy1.rotation.set(0.8, 0.4, 0)

    // Gold/Blue companion galaxy
    const galaxy2 = createGalaxy({
      count: 25000, size: 18.0, radius: 800, branches: 4, spin: 0.002,
      randomness: 0.5, randomnessPower: 3,
      insideColor: 0xffb800, outsideColor: 0x1e6fff
    })
    galaxy2.position.set(-2500, -1000, -3200)
    galaxy2.rotation.set(-0.5, 0.2, 0)

    // ── DUST CLOUDS ───────────────────────────────────────────────────────
    const DUST_COUNT = 2500 // Increased count for larger area
    const dustGeo = new THREE.BufferGeometry()
    const dustPos = new Float32Array(DUST_COUNT * 3)
    const dustVels = new Float32Array(DUST_COUNT)
    for (let i = 0; i < DUST_COUNT; i++) {
      // Massive spawn area to prevent seeing edges
      dustPos[i * 3] = (Math.random() - 0.5) * 15000
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 15000
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5000
      dustVels[i] = 1.0 + Math.random() * 2.5
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))

    const dustMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x1a3a6e) } },
      vertexShader: `
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (3000.0 / -mvPosition.z);
          vAlpha = smoothstep(-4000.0, -100.0, mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if(d > 0.5) discard;
          float intensity = pow(1.0 - (d * 2.0), 3.0);
          gl_FragColor = vec4(uColor, intensity * vAlpha * 0.15);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    // ── PROCEDURAL VOYAGER SPACECRAFT ─────────────────────────────────────
    const ship = new THREE.Group()
    scene.add(ship)

    // Materials
    const foilMat = new THREE.MeshStandardMaterial({
      color: 0xdda855, metalness: 0.9, roughness: 0.4, bumpScale: 0.02
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe0e5ec, metalness: 0.8, roughness: 0.2
    })
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x333333, metalness: 0.6, roughness: 0.6
    })

    // 1. Main Bus (decagon cylinder)
    const busGeo = new THREE.CylinderGeometry(8, 8, 10, 10)
    const bus = new THREE.Mesh(busGeo, foilMat)
    bus.rotation.x = Math.PI / 2
    ship.add(bus)

    // 2. High-Gain Antenna (Dish)
    // Create a bowl shape using a sphere segment
    const dishGeo = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3.5)
    const dish = new THREE.Mesh(dishGeo, metalMat)
    dish.position.z = -6
    dish.rotation.x = Math.PI // Face forward (negative Z)
    // Make the dish double-sided so we see the back
    dish.material.side = THREE.DoubleSide
    ship.add(dish)

    // Dish feed horn (center stick)
    const feedGeo = new THREE.CylinderGeometry(0.5, 0.2, 16, 8)
    const feed = new THREE.Mesh(feedGeo, darkMetalMat)
    feed.position.z = -14
    feed.rotation.x = Math.PI / 2
    ship.add(feed)

    // 3. RTG Power Source (boom extending back/down)
    const rtgBoomGeo = new THREE.CylinderGeometry(0.8, 0.8, 25, 8)
    const rtgBoom = new THREE.Mesh(rtgBoomGeo, metalMat)
    rtgBoom.position.set(-12, -8, 15)
    rtgBoom.rotation.set(-0.3, 0, 0.8)
    ship.add(rtgBoom)

    const rtgGeo = new THREE.CylinderGeometry(3, 3, 12, 16)
    const rtg = new THREE.Mesh(rtgGeo, darkMetalMat)
    rtg.position.set(-20, -13.5, 23)
    rtg.rotation.set(-0.3, 0, 0.8)
    ship.add(rtg)

    // 4. Magnetometer Boom (long thin structure)
    const magBoomGeo = new THREE.BoxGeometry(1, 1, 60)
    const magBoom = new THREE.Mesh(magBoomGeo, foilMat)
    magBoom.position.set(30, 10, 20)
    magBoom.rotation.set(0.1, -0.6, 0)
    ship.add(magBoom)

    // 5. Instrument Platform
    const platformGeo = new THREE.BoxGeometry(6, 4, 15)
    const platform = new THREE.Mesh(platformGeo, metalMat)
    platform.position.set(0, -9, 8)
    ship.add(platform)

    // Subtle pulsing blue instrument light
    const instLight = new THREE.PointLight(0xffcc44, 2.0, 50)
    instLight.position.set(0, -9, 8)
    ship.add(instLight)

    // Position ship and scale
    ship.position.set(0, 0, -60)
    ship.rotation.set(0.1, Math.PI, 0.15) // facing away (negative Z), slightly tilted


    // ── STARFIELD — 3 depth layers, random sizes + pink tints ────────────
    const STAR_VERT = `
      attribute float aSize;
      attribute vec3  aColor;
      attribute float aPhase;
      varying   float vAlpha;
      varying   vec3  vColor;
      varying   float vPhase;
      void main() {
        vColor = aColor;
        vPhase = aPhase;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position  = projectionMatrix * mvPosition;
        
        // Normal point size for sparkling stars
        gl_PointSize = (aSize * 2500.0) / -mvPosition.z;
        vAlpha = smoothstep(-5000.0, -800.0, mvPosition.z);
      }
    `
    const STAR_FRAG = `
      uniform float uTime;
      varying float vAlpha;
      varying vec3  vColor;
      varying float vPhase;
      void main() {
        // Distance from center of the point sprite
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        
        // Sparkling glowing circle
        float core = pow(1.0 - (d * 2.0), 3.0);
        float halo = pow(1.0 - (d * 2.0), 1.2) * 0.35;
        float intensity = core + halo;
        
        // Dynamic twinkling effect using sine wave and random phase
        float twinkle = 0.5 + 0.5 * sin(uTime * 4.0 + vPhase);
        intensity *= (0.4 + 0.6 * twinkle); // Keep minimum brightness at 40%
        
        gl_FragColor = vec4(vColor, intensity * vAlpha);
      }
    `

    function makeStarLayer({ count, spread, zRange, sizeMin, sizeMax, cylindrical }) {
      const geo  = new THREE.BufferGeometry()
      const pos  = new Float32Array(count * 3)
      const size = new Float32Array(count)
      const col  = new Float32Array(count * 3)
      const vels = new Float32Array(count)
      const phase = new Float32Array(count)

      // Colour palette: Lots of pinks and soft whites
      const palette = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0xffb6c1), // Light Pink
        new THREE.Color(0xff69b4), // Hot Pink
        new THREE.Color(0xff1493), // Deep Pink
        new THREE.Color(0xffc0cb), // Pink
        new THREE.Color(0xfddde6), // Very Soft Pink
      ]

      for (let i = 0; i < count; i++) {
        if (cylindrical) {
          const theta = Math.random() * Math.PI * 2
          const r = 30 + Math.random() * spread
          pos[i*3]   = Math.cos(theta) * r
          pos[i*3+1] = Math.sin(theta) * r
        } else {
          pos[i*3]   = (Math.random() - 0.5) * spread
          pos[i*3+1] = (Math.random() - 0.5) * spread
        }
        pos[i*3+2] = -Math.random() * zRange + 600

        vels[i] = 1.0 + Math.random() * 6.0
        phase[i] = Math.random() * Math.PI * 2.0 // Random twinkle offset

        // Random size — occasional big bright sparkler
        const isBright = Math.random() < 0.06
        size[i] = isBright
          ? sizeMax * (1.4 + Math.random() * 1.2)
          : sizeMin + Math.random() * (sizeMax - sizeMin)

        const c = palette[Math.floor(Math.random() * palette.length)]
        col[i*3]   = c.r
        col[i*3+1] = c.g
        col[i*3+2] = c.b
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos,  3))
      geo.setAttribute('aSize',    new THREE.BufferAttribute(size, 1))
      geo.setAttribute('aColor',   new THREE.BufferAttribute(col,  3))
      geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1))

      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0.0 } },
        vertexShader:   STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      })
      const points = new THREE.Points(geo, mat)
      scene.add(points)
      
      return {
        points,
        geo,
        mat,
        vels,
        count,
        spread,
        cylindrical
      }
    }

    // Layer 1 — deep background: many tiny stars spread wide
    const starLayer1 = makeStarLayer({
      count: 22000, spread: 8000, zRange: 6000,
      sizeMin: 0.3, sizeMax: 1.0, cylindrical: false
    })
    // Layer 2 — mid-field: medium density cylinder of stars
    const starLayer2 = makeStarLayer({
      count: 30000, spread: 3000, zRange: 4500,
      sizeMin: 0.6, sizeMax: 1.8, cylindrical: true
    })
    // Layer 3 — foreground sparklers: fewer, large, vivid
    const starLayer3 = makeStarLayer({
      count: 10000, spread: 4000, zRange: 3000,
      sizeMin: 1.2, sizeMax: 3.2, cylindrical: false
    })

    const starLayers = [starLayer1, starLayer2, starLayer3]


    // ── ASTEROID FIELD ────────────────────────────────────────────────────
    const ASTEROID_COUNT = 15
    // Use an Icosahedron with a custom shader to deform vertices procedurally
    const rockGeo = new THREE.IcosahedronGeometry(8, 3)

    const rockMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x1a2a40) },
        uRimColor: { value: new THREE.Color(0x7ab8ff) },
        uLightDir: { value: rimLight.position.clone().normalize() }
      },
      vertexShader: ASTEROID_VERT,
      fragmentShader: ASTEROID_FRAG,
    })

    const asteroids = new THREE.InstancedMesh(rockGeo, rockMat, ASTEROID_COUNT)
    scene.add(asteroids)

    // Setup asteroid instances
    const dummy = new THREE.Object3D()
    const astData = []

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const x = (Math.random() - 0.5) * 800
      const y = (Math.random() - 0.5) * 800
      const z = -Math.random() * 4000 - 500

      const scale = 0.2 + Math.random() * 2.5

      dummy.position.set(x, y, z)
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      asteroids.setMatrixAt(i, dummy.matrix)

      astData.push({
        pos: new THREE.Vector3(x, y, z),
        rot: dummy.rotation.clone(),
        rotVel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
        speed: 1.5 + Math.random() * 4.0,
        scale: scale
      })
    }
    asteroids.instanceMatrix.needsUpdate = true


    // ── CAMERA SETUP ──────────────────────────────────────────────────────
    // Position the camera to the left so the ship (at x=0) appears on the right side of the screen,
    // avoiding the hero profile card on the left.
    camera.position.set(-45, -10, 40)
    camera.lookAt(0, 0, -200)

    // Mouse parallax tracking
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / W - 0.5)
      my = (e.clientY / H - 0.5)
    }
    window.addEventListener('mousemove', onMouse)


    // ── ANIMATION LOOP ────────────────────────────────────────────────────
    let animId, time = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      time += 0.016 // ~60fps fixed step for procedural time

      nebulaUni.uTime.value = time

      // 1. Spacecraft Bobbing & Parallax
      // Ship gently floats/vibrates
      ship.position.y = -60 + Math.sin(time * 2.0) * 1.5
      ship.position.x = Math.cos(time * 1.2) * 1.0
      ship.rotation.z = 0.15 + Math.sin(time * 1.5) * 0.02

      // Instrument light pulses
      instLight.intensity = 1.0 + Math.sin(time * 8.0) * 0.5

      // 2. Warp Stars Forward
      starLayers.forEach(layer => {
        layer.mat.uniforms.uTime.value = time
        
        const posArr = layer.geo.attributes.position.array
        const vels = layer.vels
        const count = layer.count

        for (let i = 0; i < count; i++) {
          posArr[i * 3 + 2] += vels[i] * 3.5 // Normal drifting speed forward
          
          if (posArr[i * 3 + 2] > 600) { // Passed the camera
            posArr[i * 3 + 2] = -5000 // Reset far away
            // Re-randomize x/y to avoid noticeable looping
            if (layer.cylindrical) {
              const theta = Math.random() * Math.PI * 2
              const r = 30 + Math.random() * layer.spread
              posArr[i * 3] = Math.cos(theta) * r
              posArr[i * 3 + 1] = Math.sin(theta) * r
            } else {
              posArr[i * 3] = (Math.random() - 0.5) * layer.spread
              posArr[i * 3 + 1] = (Math.random() - 0.5) * layer.spread
            }
          }
        }
        layer.geo.attributes.position.needsUpdate = true
      })

      // Dust Clouds drifting
      const dustPosArr = dustGeo.attributes.position.array
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPosArr[i * 3 + 2] += dustVels[i] * 1.5 // Slower than stars
        if (dustPosArr[i * 3 + 2] > 100) {
          dustPosArr[i * 3 + 2] = -4000
          dustPosArr[i * 3] = (Math.random() - 0.5) * 4000
          dustPosArr[i * 3 + 1] = (Math.random() - 0.5) * 3000
        }
      }
      dustGeo.attributes.position.needsUpdate = true

      // 3. Asteroids Flying Past & Tumbling
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        const d = astData[i]
        d.pos.z += d.speed * 4.0 // Move forward

        // Tumble
        d.rot.x += d.rotVel.x
        d.rot.y += d.rotVel.y
        d.rot.z += d.rotVel.z

        if (d.pos.z > 200) {
          d.pos.z = -4000
          d.pos.x = (Math.random() - 0.5) * 800
          d.pos.y = (Math.random() - 0.5) * 800
        }

        dummy.position.copy(d.pos)
        dummy.rotation.copy(d.rot)
        dummy.scale.set(d.scale, d.scale, d.scale)
        dummy.updateMatrix()
        asteroids.setMatrixAt(i, dummy.matrix)
      }
      asteroids.instanceMatrix.needsUpdate = true

      // 4. Galaxy Rotation
      if (galaxies.length > 0) {
        galaxies[0].rotation.y += 0.0005
        if (galaxies.length > 1) galaxies[1].rotation.y -= 0.0008
      }

      // 4. Camera Parallax ( Cinematic Drifting )
      // Base X is -45 (pushed left) so the ship remains on the right
      const targetX = -45 + mx * 30
      const targetY = -10 - my * 20
      camera.position.x += (targetX - camera.position.x) * 0.02
      camera.position.y += (targetY - camera.position.y) * 0.02
      camera.lookAt(0, 0, -200)

      renderer.render(scene, camera)
    }
    animate()

    // ── RESIZE ────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="three-bg" aria-hidden="true" />
}
