import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './ThreeBackground.css'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth
    const h = mount.clientHeight

    // ── Scene ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000)
    camera.position.z = 500

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Star field (gold) ───────────────────────────────────────────────
    const makeStars = (count, color, size, spread) => {
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * spread
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: Math.random() * 0.4 + 0.5,
        sizeAttenuation: true,
      })
      return new THREE.Points(geo, mat)
    }

    const goldStars = makeStars(2500, 0xe8c547, 1.4, 2000)
    const whiteStars = makeStars(1800, 0xd0e8f5, 0.9, 2200)
    const tealStars = makeStars(800, 0x06b6d4, 1.1, 1800)
    scene.add(goldStars, whiteStars, tealStars)

    // ── Floating orbs (Devil Fruits / ocean spirits) ──────────────────────
    const orbConfigs = [
      { color: 0xe8c547, emissive: 0xc9a832, radius: 10, x: 180, y: 80, z: -120, speed: 0.002, floatAmp: 25 },
      { color: 0x1a7fc1, emissive: 0x0a4a7a, radius: 7, x: -200, y: -60, z: -200, speed: 0.003, floatAmp: 18 },
      { color: 0xc0392b, emissive: 0x8b1c1c, radius: 6, x: 220, y: -140, z: -180, speed: 0.0025, floatAmp: 22 },
      { color: 0x06b6d4, emissive: 0x0e7490, radius: 5, x: -120, y: 130, z: -250, speed: 0.004, floatAmp: 14 },
      { color: 0xe8c547, emissive: 0xb8982e, radius: 4, x: -60, y: -90, z: -160, speed: 0.005, floatAmp: 16 },
    ]

    const orbs = orbConfigs.map(({ color, emissive, radius, x, y, z, speed, floatAmp }) => {
      const geo = new THREE.SphereGeometry(radius, 32, 32)
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.75,
        shininess: 80,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      mesh.userData = { baseY: y, speed, floatAmp }
      scene.add(mesh)
      return mesh
    })

    // ── Ring around each orb ───────────────────────────────────────────────
    const rings = orbs.slice(0, 2).map((orb) => {
      const r = orb.geometry.parameters.radius
      const geo = new THREE.TorusGeometry(r * 2.2, 0.3, 8, 64)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xe8c547,
        transparent: true,
        opacity: 0.18,
        wireframe: false,
      })
      const ring = new THREE.Mesh(geo, mat)
      ring.position.copy(orb.position)
      ring.rotation.x = Math.PI / 3
      scene.add(ring)
      return { mesh: ring, orb }
    })

    // ── Nebula / galaxy cloud ─────────────────────────────────────────────
    const cloudCount = 500
    const cloudPositions = new Float32Array(cloudCount * 3)
    for (let i = 0; i < cloudCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = 150 + Math.random() * 250
      cloudPositions[i * 3] = Math.cos(theta) * r
      cloudPositions[i * 3 + 1] = (Math.random() - 0.5) * 100
      cloudPositions[i * 3 + 2] = Math.sin(theta) * r - 300
    }
    const cloudGeo = new THREE.BufferGeometry()
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3))
    const cloudMat = new THREE.PointsMaterial({
      color: 0x1a7fc1,
      size: 2.5,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    })
    scene.add(new THREE.Points(cloudGeo, cloudMat))

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff8dc, 0.5))
    const goldLight = new THREE.PointLight(0xe8c547, 1.5, 800)
    goldLight.position.set(100, 200, 200)
    scene.add(goldLight)
    const oceanLight = new THREE.PointLight(0x1a7fc1, 1, 600)
    oceanLight.position.set(-200, -100, 100)
    scene.add(oceanLight)

    // ── Mouse parallax ────────────────────────────────────────────────────
    let targetX = 0, targetY = 0
    const onMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2
      targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Touch parallax ────────────────────────────────────────────────────
    const onTouchMove = (e) => {
      const t = e.touches[0]
      targetX = (t.clientX / window.innerWidth - 0.5) * 2
      targetY = (t.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // ── Animation loop ────────────────────────────────────────────────────
    let animId
    let t = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.01

      // Slowly rotate star fields
      goldStars.rotation.x += 0.00008
      goldStars.rotation.y += 0.00012
      whiteStars.rotation.x -= 0.00006
      whiteStars.rotation.y -= 0.00010
      tealStars.rotation.y += 0.00015

      // Camera parallax with mouse
      camera.position.x += (targetX * 60 - camera.position.x) * 0.025
      camera.position.y += (-targetY * 35 - camera.position.y) * 0.025
      camera.lookAt(scene.position)

      // Float orbs up and down
      orbs.forEach((orb, i) => {
        const { baseY, speed, floatAmp } = orb.userData
        orb.position.y = baseY + Math.sin(t * speed * 100 + i * 1.3) * floatAmp
        orb.rotation.x += speed * 0.8
        orb.rotation.z += speed * 0.5
      })

      // Rotate rings
      rings.forEach(({ mesh }, i) => {
        mesh.rotation.z += 0.003 + i * 0.001
        mesh.rotation.x += 0.001
      })

      // Pulsing gold light
      goldLight.intensity = 1.2 + Math.sin(t * 2) * 0.5

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="three-bg" aria-hidden="true" />
}
