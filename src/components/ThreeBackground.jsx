import { useEffect, useRef } from 'react'
import './ThreeBackground.css'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// GLSL — Accretion Disk Shader
// Physically motivated: Doppler beaming, ISCO temperature, fBm plasma turbulence
// ─────────────────────────────────────────────────────────────────────────────
const DISK_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const DISK_FRAG = `
  uniform float uTime;
  uniform float uInner;    // ISCO inner edge (normalized 0–1 from center)
  uniform float uBright;   // brightness multiplier (secondary image is dimmer)
  varying vec2 vUv;

  // ── Noise utilities ──────────────────────────────────────────────────────
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p),f=fract(p);
    f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  // Fractal Brownian Motion — creates turbulent plasma appearance
  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(0.4,0.7); a*=0.52; }
    return v;
  }

  void main() {
    vec2 c  = vUv - 0.5;
    float r = length(c) * 2.0;           // 0=center, 1=outer edge
    float theta = atan(c.y, c.x);        // angle in disk plane

    // Disk annulus: inner edge = ISCO, outer fades smoothly
    float ring = smoothstep(uInner-0.01, uInner+0.012, r)
               * (1.0 - smoothstep(0.86, 1.0, r));
    if (ring < 0.001) discard;

    // ── Relativistic Doppler beaming ────────────────────────────────────
    // Disk orbits counterclockwise. The approaching side appears MUCH brighter
    // (relativistic beaming ∝ (1+β·cos(θ))^4). We fake with a pow() curve.
    float approach = 0.5 + 0.5 * sin(theta - 0.52);  // peak near theta≈0.52 rad
    float doppler  = pow(max(0.0, approach), 2.6) * 0.75 + 0.25;

    // ── Temperature from radius (ISCO = hottest) ────────────────────────
    // Disk temperature ∝ (r/r_isco)^(-3/4) in thin-disk models
    float heat = pow(max(0.0, 1.0 - smoothstep(uInner, 0.6, r)), 1.9);

    // ── Spiralling turbulent plasma (fBm, corotates with disk) ──────────
    float spiralPhase = theta - r * 4.0 - uTime * 0.55;
    float turb = fbm(vec2(r * 9.0 + uTime * 0.12, spiralPhase * 1.6));
    turb = 0.68 + 0.32 * turb;

    // ── Physically-motivated color map ──────────────────────────────────
    // inner orbit: near-white (very hot) → amber → deep orange → dark red → black
    vec3 col;
    if (heat > 0.75) {
      col = mix(vec3(1.00,0.88,0.55), vec3(1.00,0.97,0.92), (heat-0.75)/0.25);
    } else if (heat > 0.45) {
      col = mix(vec3(1.00,0.52,0.08), vec3(1.00,0.88,0.55), (heat-0.45)/0.30);
    } else if (heat > 0.18) {
      col = mix(vec3(0.72,0.12,0.02), vec3(1.00,0.52,0.08), (heat-0.18)/0.27);
    } else {
      col = mix(vec3(0.08,0.015,0.003), vec3(0.72,0.12,0.02), heat/0.18);
    }
    // ISCO incandescence: brighten near inner edge
    col *= (1.0 + heat * 2.8);

    // ── Final alpha ──────────────────────────────────────────────────────
    float alpha = ring * doppler * turb * (0.22 + 0.78 * max(heat, 0.06));
    alpha = clamp(alpha * uBright, 0.0, 0.95);

    gl_FragColor = vec4(col, alpha);
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// GLSL — X-ray Corona (hot plasma halo around the singularity)
// ─────────────────────────────────────────────────────────────────────────────
const CORONA_VERT = `varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const CORONA_FRAG = `
  uniform float uTime;
  varying vec2 vUv;
  void main(){
    vec2 p=vUv-0.5; float r=length(p)*2.0;
    float glow = pow(max(0.0, 1.0-r), 3.8);
    float flicker = 0.82 + 0.18*sin(uTime*2.1 + r*10.0);
    // Mix violet core → orange/white edge (X-ray corona colour)
    vec3 col = mix(vec3(0.35,0.02,0.55), vec3(1.0,0.65,0.25), glow*0.65) * flicker;
    gl_FragColor = vec4(col, glow * flicker * 0.5);
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth, H = mount.clientHeight

    // ── Renderer ──────────────────────────────────────────────────────────
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(52, W/H, 0.1, 5000)
    camera.position.set(-30, 460, 120)   // elevated — top-down view

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Starfield (full canvas) ───────────────────────────────────────────
    const mkStars = (n, col, sz, spread) => {
      const pos = new Float32Array(n*3)
      for(let i=0;i<n*3;i++) pos[i]=(Math.random()-0.5)*spread
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
      return new THREE.Points(geo,new THREE.PointsMaterial({color:col,size:sz,transparent:true,opacity:0.88,sizeAttenuation:true}))
    }
    scene.add(mkStars(4500,0xffffff,1.0,3200))
    scene.add(mkStars(1200,0xa78bfa,1.3,2600))
    scene.add(mkStars(700, 0x60d4f7,0.9,2200))

    // ── Black hole scene group — offset RIGHT so it appears in right panel ─
    // Camera at z=700, FOV=52°. halfWidth = 700*tan(26°)≈342 units.
    // Moving group to x=+175→ appears at 50%+(175/342)*50% ≈ 75.5% from left ✓
    const BH_X = 175
    const g = new THREE.Group()
    g.position.x = BH_X
    scene.add(g)

    // ── Event horizon shadow sphere (pure black, occludes everything behind) ─
    const EH_R = 82    // visual radius of shadow (1.5× Schwarzschild for photon capture)
    const bhGeo = new THREE.SphereGeometry(EH_R, 64, 64)
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    g.add(new THREE.Mesh(bhGeo, bhMat))

    // ── Photon ring layers (the bright "fire ring" in EHT images) ─────────
    const photonRings = [
      { r: EH_R+3,  w: 0.8, c: 0xffffff, o: 1.0 },   // innermost: pure white
      { r: EH_R+5,  w: 1.4, c: 0xfff5d0, o: 0.85 },
      { r: EH_R+8,  w: 2.5, c: 0xff9944, o: 0.55 },
      { r: EH_R+14, w: 4.0, c: 0xff4400, o: 0.25 },
    ]
    photonRings.forEach(({r,w,c,o})=>{
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r,w,8,256),
        new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o})
      )
      ring.rotation.x = Math.PI/2
      g.add(ring)
    })

    // ── PRIMARY Accretion disk ────────────────────────────────────────────
    // Inclined ~17° from horizontal (realistic viewing angle)
    const DISK_OUTER = 420
    const DISK_INNER_NORM = (EH_R*1.4)/DISK_OUTER   // ISCO ≈ 3×rs, mapped to 0–1

    const diskUniforms = { uTime:{value:0}, uInner:{value:DISK_INNER_NORM}, uBright:{value:1.0} }
    const diskMat = new THREE.ShaderMaterial({
      uniforms: diskUniforms,
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const diskGeo = new THREE.CircleGeometry(DISK_OUTER, 320)
    const disk = new THREE.Mesh(diskGeo, diskMat)
    disk.rotation.x = Math.PI / 2      // perfectly flat — face-on from above
    g.add(disk)

    // Secondary lensed image — hidden from top view (not meaningful face-on)
    const disk2Uni = { uTime:{value:0}, uInner:{value:DISK_INNER_NORM*1.6}, uBright:{value:0.0} }
    const disk2Mat = new THREE.ShaderMaterial({
      uniforms: disk2Uni,
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const disk2 = new THREE.Mesh(new THREE.CircleGeometry(DISK_OUTER*0.5, 256), disk2Mat)
    disk2.rotation.x = -(Math.PI / 2.08 + 0.12)  // opposite tilt, compressed
    disk2.scale.y = 0.22                           // very flat (lensed = appears squeezed)
    disk2.position.y = EH_R * 0.9                 // just above the shadow
    g.add(disk2)

    // ── Inner bright ring glow (ISCO brightening) ─────────────────────────
    const iscoRings = [
      { r: EH_R*1.45, w: 6,  c: 0xffffff, o: 0.35 },
      { r: EH_R*1.65, w: 9,  c: 0xff9900, o: 0.25 },
      { r: EH_R*1.9,  w: 12, c: 0xff4400, o: 0.15 },
      { r: EH_R*2.3,  w: 15, c: 0x882200, o: 0.07 },
    ]
    iscoRings.forEach(({r,w,c,o})=>{
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r,w,8,200),
        new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:THREE.DoubleSide})
      )
      ring.rotation.x = Math.PI / 2   // flat, matches main disk
      g.add(ring)
    })

    // ── X-ray Corona ──────────────────────────────────────────────────────
    const coronaUni = { uTime:{value:0} }
    const corona = new THREE.Mesh(
      new THREE.PlaneGeometry(EH_R*5.5, EH_R*5.5),
      new THREE.ShaderMaterial({
        uniforms: coronaUni, vertexShader: CORONA_VERT, fragmentShader: CORONA_FRAG,
        transparent:true, depthWrite:false, side:THREE.DoubleSide
      })
    )
    g.add(corona)


    // ── Infalling particle spiral ─────────────────────────────────────────
    const PART_N = 1800
    const partPos = new Float32Array(PART_N * 3)
    const partVels = new Float32Array(PART_N)   // angular speeds (inner = faster)
    const partAngles = new Float32Array(PART_N) // current angle
    for(let i=0;i<PART_N;i++){
      const r = EH_R*1.6 + Math.random() * (DISK_OUTER - EH_R*1.6)
      const theta = Math.random()*Math.PI*2
      const flatness = (Math.random()-0.5)*25
      partPos[i*3]   = Math.cos(theta)*r
      partPos[i*3+1] = flatness
      partPos[i*3+2] = Math.sin(theta)*r
      partVels[i]  = 0.003 + 0.004*(1-(r-EH_R*1.6)/(DISK_OUTER-EH_R*1.6))
      partAngles[i] = theta
    }
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos,3))
    const partMesh = new THREE.Points(partGeo,
      new THREE.PointsMaterial({color:0xff6600,size:1.8,transparent:true,opacity:0.55,sizeAttenuation:true})
    )
    partMesh.rotation.x = Math.PI / 2  // flat — matches disk
    g.add(partMesh)

    // ── Lights (for future MeshStandardMaterial objects) ─────────────────
    const vLight = new THREE.PointLight(0x7c3aed,2.8,800)
    vLight.position.set(0,0,200); g.add(vLight)
    const oLight = new THREE.PointLight(0xff6600,1.6,500)
    oLight.position.set(60,-30,100); g.add(oLight)

    // ── Mouse parallax ────────────────────────────────────────────────────
    // Stars drift with mouse; BH group has subtle counter-drift for depth
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX/window.innerWidth  - 0.5)
      my = (e.clientY/window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMouse)

    // ── Animation loop ────────────────────────────────────────────────────
    let animId, t = 0
    const partPosArr = partGeo.attributes.position.array
    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.007

      // Update shader uniforms
      diskUniforms.uTime.value  = t
      disk2Uni.uTime.value      = t
      coronaUni.uTime.value     = t

      // Spin disks (differential rotation — inner faster)
      disk.rotation.z  += 0.0022
      disk2.rotation.z -= 0.0016

      // Orbit ISCO rings slightly
      g.children.forEach(c => {
        if(c.geometry?.type === 'TorusGeometry' && Math.abs(c.rotation.x - Math.PI/2.08) < 0.01) {
          c.rotation.z += 0.0018
        }
      })

      // Animate infalling particles: spiral inward
      for(let i=0;i<PART_N;i++){
        partAngles[i] += partVels[i]
        const origR = EH_R*1.6 + (DISK_OUTER - EH_R*1.6) *
                      ((partPos[i*3]*partPos[i*3] + partPos[i*3+2]*partPos[i*3+2]) > 0
                       ? 1 : 0.5)
        const newTheta = partAngles[i]
        const r = Math.sqrt(partPosArr[i*3]*partPosArr[i*3] + partPosArr[i*3+2]*partPosArr[i*3+2])
        const newR = Math.max(EH_R*1.55, r - 0.05)  // slowly spiral inward
        partPosArr[i*3]   = Math.cos(newTheta)*newR
        partPosArr[i*3+2] = Math.sin(newTheta)*newR
        if(newR <= EH_R*1.55){  // reset
          const resetR = DISK_OUTER * (0.4 + Math.random()*0.55)
          partAngles[i] = Math.random()*Math.PI*2
          partPosArr[i*3]   = Math.cos(partAngles[i])*resetR
          partPosArr[i*3+2] = Math.sin(partAngles[i])*resetR
        }
      }
      partGeo.attributes.position.needsUpdate = true


      // Lights pulse
      vLight.intensity = 2.5 + Math.sin(t*1.5)*0.8
      oLight.intensity = 1.4 + Math.sin(t*2.3+1.1)*0.5

      // Camera drift — top-down angle, mouse nudges X/Z
      camera.position.x += (mx * 28 - 30 - camera.position.x) * 0.025
      camera.position.z += (my * 28 + 120 - camera.position.z) * 0.025
      camera.lookAt(BH_X, 0, 0)   // always look at BH centre

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw=mount.clientWidth, nh=mount.clientHeight
      camera.aspect=nw/nh; camera.updateProjectionMatrix()
      renderer.setSize(nw,nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="three-bg" aria-hidden="true" />
}
