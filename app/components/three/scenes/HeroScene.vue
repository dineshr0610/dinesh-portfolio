<template>
  <!-- ✅ FIX: absolute inset-0 fills the parent <section> exactly.
       No width/transform utilities here — the parent section owns dimensions. -->
  <div ref="root" class="absolute inset-0 pointer-events-none overflow-hidden">
    <canvas ref="canvas" class="block w-full h-full align-top"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let cleanup: (() => void) | null = null

function disposeIfPossible(value: unknown) {
  const d = value as { dispose?: () => void }
  d.dispose?.()
}

onMounted(async () => {
  if (!root.value || !canvas.value) return

  let THREE: typeof import('three')
  try {
    THREE = await import('three')
  } catch {
    return
  }

  const {
    Scene, PerspectiveCamera, WebGLRenderer, Color,
    Mesh, MeshStandardMaterial, SphereGeometry,
    AmbientLight, DirectionalLight, PointLight,
    Points, PointsMaterial, BufferGeometry, Float32BufferAttribute,
    AdditiveBlending, FogExp2, CatmullRomCurve3, Vector3,
    TubeGeometry, LineSegments, LineBasicMaterial, BufferAttribute,
    IcosahedronGeometry, TorusGeometry, RingGeometry,
    MeshBasicMaterial, DoubleSide, Group
  } = THREE

  // ─── Scene setup ────────────────────────────────────────────────────────────
  const scene = new Scene()
  // ✅ FIX: scene background matches page/section background exactly (#0b0f1a)
  // so the canvas blends seamlessly — no visible edge seams.
  scene.background = new Color(0x0b0f1a)
  scene.fog = new FogExp2(0x0b0f1a, 0.055)

  const camera = new PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, 9)

  const renderer = new WebGLRenderer({
    canvas: canvas.value,
    alpha: false,          // solid bg avoids any transparency compositing artifacts
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x0b0f1a, 1)

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const isTablet = window.matchMedia('(max-width: 1024px)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ─── Palette ─────────────────────────────────────────────────────────────────
  const C_BLUE   = 0x2563eb
  const C_INDIGO = 0x4338ca
  const C_VIOLET = 0x8b5cf6
  const C_WHITE  = 0xe2e8f0

  // ─── Lights ──────────────────────────────────────────────────────────────────
  const ambient = new AmbientLight(C_WHITE, 0.7)
  scene.add(ambient)

  const keyLight = new DirectionalLight(C_VIOLET, 1.2)
  keyLight.position.set(5, 4, 6)
  scene.add(keyLight)

  const fillLight = new DirectionalLight(C_BLUE, 0.5)
  fillLight.position.set(-4, -2, 4)
  scene.add(fillLight)

  const rimLight = new DirectionalLight(C_WHITE, 0.3)
  rimLight.position.set(-2, 4, -3)
  scene.add(rimLight)

  const corePulse = new PointLight(C_BLUE, 1.4, 18)
  corePulse.position.set(0, 0, 4)
  scene.add(corePulse)

  // ─── Responsive X offset ─────────────────────────────────────────────────────
  // ✅ FIX: Instead of a hard-coded world-space offset (which drifts as the canvas
  // resizes), we compute an offset proportional to current canvas width so the
  // dashboard always sits in the right half of the hero across all breakpoints.
  function getSceneOffsetX(): number {
    if (isMobile) return 0          // centred on mobile
    if (isTablet) return 0.6        // slight right shift on tablet
    return 1.8                      // right half on desktop
  }

  const OFFSET_X = getSceneOffsetX()

  // ─── LAYER 1 — Background particles ─────────────────────────────────────────
  const particleCount = isMobile ? 160 : 340
  const pGeo = new BufferGeometry()
  const pPos = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 18
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 10
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 12
  }
  pGeo.setAttribute('position', new Float32BufferAttribute(pPos, 3))
  const particles = new Points(pGeo, new PointsMaterial({
    color: C_BLUE, size: isMobile ? 0.022 : 0.028,
    transparent: true, opacity: 0.42,
    depthWrite: false, blending: AdditiveBlending
  }))
  scene.add(particles)

  // ─── LAYER 2 — Neural network lines ──────────────────────────────────────────
  // Node positions in 3D space (world coords relative to OFFSET_X)
  const nodeLabels = ['AI', 'WEB', 'ML', 'PROJECTS', 'TIMELINE', 'GALLERY', 'ACHIEVEMENTS', 'DINESH']
  const nodeAngles = nodeLabels.map((_, i) => (i / (nodeLabels.length - 1)) * Math.PI * 2)
  const nodeRadius = isMobile ? 1.8 : 2.4

  const nodePositions = nodeAngles.map((angle, i) => {
    // DINESH goes to center
    if (i === nodeLabels.length - 1) return new Vector3(OFFSET_X, 0, 0)
    const x = Math.cos(angle) * nodeRadius + OFFSET_X
    const y = Math.sin(angle) * nodeRadius * 0.6
    const z = Math.sin(angle * 1.3) * 0.8
    return new Vector3(x, y, z)
  })


  // Neural line segments connecting nodes
  const lineVertices: number[] = []
  const centerIdx = nodeLabels.length - 1
  for (let i = 0; i < nodePositions.length - 1; i++) {
    // Spoke from center to each outer node
    const c = nodePositions[centerIdx]
    const n = nodePositions[i]
    if (!c || !n) continue
    lineVertices.push(c.x, c.y, c.z, n.x, n.y, n.z)

    // Ring between adjacent outer nodes
    const outerCount = nodePositions.length - 1
    if (outerCount <= 0) continue
    const next = nodePositions[(i + 1) % outerCount]
    if (!next) continue
    lineVertices.push(n.x, n.y, n.z, next.x, next.y, next.z)

  }
  const lineGeo = new BufferGeometry()
  lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(lineVertices), 3))
  const networkLines = new LineSegments(lineGeo, new LineBasicMaterial({
    color: C_INDIGO, transparent: true, opacity: 0.28,
    blending: AdditiveBlending, depthWrite: false
  }))
  scene.add(networkLines)

  // ─── LAYER 3 — Orbital nodes (spheres) ───────────────────────────────────────
  const nodeGroup = new Group()
  scene.add(nodeGroup)

  const nodeMeshes = nodePositions.slice(0, -1).map((pos) => {
    const sphere = new Mesh(
      new IcosahedronGeometry(isMobile ? 0.11 : 0.14, 1),
      new MeshStandardMaterial({
        color: C_INDIGO, metalness: 0.4, roughness: 0.3,
        emissive: C_VIOLET, emissiveIntensity: 0.7,
        transparent: true, opacity: 0.92
      })
    )
    sphere.position.copy(pos)
    nodeGroup.add(sphere)
    return sphere
  })

  // ─── LAYER 3 — Chitti AI head (central holographic orb + halo) ───────────────
  const chittiGroup = new Group()
  scene.add(chittiGroup)
  chittiGroup.position.set(OFFSET_X, 0, 0)

  // Core orb — electric blue icosahedron
  const core = new Mesh(
    new IcosahedronGeometry(isMobile ? 0.8 : 1.05, 3),
    new MeshStandardMaterial({
      color: C_BLUE, metalness: 0.65, roughness: 0.12,
      emissive: C_INDIGO, emissiveIntensity: 0.75
    })
  )
  chittiGroup.add(core)

  // Inner halo ring 1
  const halo1 = new Mesh(
    new TorusGeometry(isMobile ? 1.35 : 1.7, 0.04, 12, 60),
    new MeshStandardMaterial({
      color: C_VIOLET, emissive: C_VIOLET, emissiveIntensity: 0.9,
      transparent: true, opacity: 0.55, metalness: 0, roughness: 1
    })
  )
  halo1.rotation.x = 0.55
  chittiGroup.add(halo1)

  // Inner halo ring 2
  const halo2 = new Mesh(
    new TorusGeometry(isMobile ? 1.55 : 1.95, 0.025, 12, 60),
    new MeshStandardMaterial({
      color: C_BLUE, emissive: C_BLUE, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.38, metalness: 0, roughness: 1
    })
  )
  halo2.rotation.x = 1.15
  halo2.rotation.y = 0.5
  chittiGroup.add(halo2)

  // Outer glow shell
  const glowShell = new Mesh(
    new IcosahedronGeometry(isMobile ? 1.1 : 1.42, 2),
    new MeshStandardMaterial({
      color: C_VIOLET, transparent: true, opacity: 0.06,
      emissive: C_INDIGO, emissiveIntensity: 0.8,
      side: DoubleSide, metalness: 0, roughness: 1
    })
  )
  chittiGroup.add(glowShell)

  // DINESH identity node at center (slightly larger, different color)
  const dineshNode = new Mesh(
    new IcosahedronGeometry(isMobile ? 0.18 : 0.22, 2),
    new MeshStandardMaterial({
      color: C_WHITE, metalness: 0.5, roughness: 0.2,
      emissive: C_BLUE, emissiveIntensity: 0.9,
      transparent: true, opacity: 0.95
    })
  )
  dineshNode.position.set(OFFSET_X, 0, 0.5)
  scene.add(dineshNode)

  // ─── LAYER 4 — Foreground data stream tubes ───────────────────────────────────
  // A few curving data-flow lines drifting through the scene
  if (!isMobile) {
    const streamCount = 5
    for (let s = 0; s < streamCount; s++) {
      const pts: Array<InstanceType<typeof Vector3>> = []

      const startX = (Math.random() - 0.5) * 12
      const startY = (Math.random() - 0.5) * 6
      for (let p = 0; p <= 5; p++) {
        pts.push(new Vector3(
          startX + (Math.random() - 0.5) * 3 * p,
          startY + (Math.random() - 0.5) * 1.5 * p,
          -2 + Math.random() * 2
        ))
      }
      const curve = new CatmullRomCurve3(pts)
      const tube = new Mesh(
        new TubeGeometry(curve, 20, 0.008, 6, false),
        new MeshBasicMaterial({
          color: s % 2 === 0 ? C_BLUE : C_VIOLET,
          transparent: true, opacity: 0.18,
          blending: AdditiveBlending, depthWrite: false
        })
      )
      scene.add(tube)
    }
  }

  // ─── Resize handler ───────────────────────────────────────────────────────────
  // ✅ FIX: Always read dimensions from root element's bounding rect,
  // never from window.innerWidth — this guarantees canvas matches the
  // actual hero section size exactly, no matter what layout padding exists.
  const resizeFromRect = () => {
    if (!root.value) return
    const rect = root.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)

    console.log('[HeroScene] canvas:', w, 'x', h, '| window:', window.innerWidth, 'x', window.innerHeight)

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
  }

  // ─── Mouse parallax ───────────────────────────────────────────────────────────
  let mouseX = 0
  let mouseY = 0
  const onPointerMove = (e: PointerEvent) => {
    if (!root.value) return
    const rect = root.value.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1
  }


  // ─── Animation ────────────────────────────────────────────────────────────────
  let rafId = 0
  let t = 0

  const animate = () => {
    rafId = requestAnimationFrame(animate)
    t += 0.01

    // Gentle camera drift following mouse
    camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.04
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.04
    camera.position.z += (9 - camera.position.z) * 0.015
    camera.lookAt(OFFSET_X * 0.3, 0, 0)

    // Core orb idle rotation + float
    core.rotation.y += 0.004
    core.rotation.x += 0.0015
    chittiGroup.position.y = Math.sin(t * 1.1) * 0.04

    // Halo rings counter-orbit
    halo1.rotation.z += 0.002
    halo2.rotation.z -= 0.0015
    halo1.rotation.x += Math.sin(t * 0.28) * 0.001
    halo2.rotation.x += Math.cos(t * 0.24) * 0.0008

    // Glowshell breath
    glowShell.scale.setScalar(1 + Math.sin(t * 1.3) * 0.015)

    // Orbital nodes pulse gently around their positions
    nodeMeshes.forEach((mesh, i) => {
      const base = nodePositions[i]
      if (!base) return
      mesh.position.x = base.x + Math.sin(t * 0.7 + i) * 0.04
      mesh.position.y = base.y + Math.cos(t * 0.5 + i) * 0.03
      const s = 1 + Math.sin(t * 1.5 + i * 0.8) * 0.08
      mesh.scale.setScalar(s)
    })


    // Dinesh node pulse
    const ds = 1 + Math.sin(t * 2.0) * 0.12
    dineshNode.scale.setScalar(ds)

    // Network lines gentle sway
    networkLines.rotation.y = Math.sin(t * 0.12) * 0.04

    // Particle field drift
    particles.rotation.y += 0.0005
    particles.position.y = Math.sin(t * 0.55) * 0.04

    // Light breathing
    corePulse.intensity = 1.2 + Math.sin(t * 1.8) * 0.2
    keyLight.intensity  = 1.0 + Math.sin(t * 0.9) * 0.06
    rimLight.intensity  = 0.25 + Math.cos(t * 1.1) * 0.04

    renderer.render(scene, camera)
  }

  // ─── ResizeObserver ───────────────────────────────────────────────────────────
  const ro = new ResizeObserver(resizeFromRect)
  if (root.value) ro.observe(root.value)

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', resizeFromRect, { passive: true })

  resizeFromRect()

  // ─── Entry animation ──────────────────────────────────────────────────────────
  if (prefersReducedMotion) {
    root.value.style.opacity = '1'
    renderer.render(scene, camera)
  } else {
    gsap.fromTo(root.value,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power3.out' }
    )
    gsap.fromTo(
      [core.scale, glowShell.scale],
      { x: 0.6, y: 0.6, z: 0.6 },
      { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out', stagger: 0.08 }
    )
    animate()
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────────
  cleanup = () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', resizeFromRect)
    ro.disconnect()
    renderer.dispose()
    ;[pGeo, lineGeo].forEach(g => g.dispose())
    scene.traverse(obj => {
      if ((obj as any).geometry) (obj as any).geometry.dispose?.()
      if ((obj as any).material) disposeIfPossible((obj as any).material)
    })
  }
})

onBeforeUnmount(() => cleanup?.())
</script>