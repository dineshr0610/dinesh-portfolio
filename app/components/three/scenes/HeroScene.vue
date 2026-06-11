<template>
  <div ref="root" class="absolute inset-0 pointer-events-none overflow-hidden">
    <canvas ref="canvas" class="h-full w-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let cleanup: (() => void) | null = null

function disposeIfPossible(value: unknown) {
  const disposable = value as { dispose?: () => void }
  disposable.dispose?.()
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
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Color,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    AmbientLight,
    DirectionalLight,
    PointLight,
    Points,
    PointsMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    AdditiveBlending,
    FogExp2
  } = THREE

  const scene = new Scene()
  scene.background = new Color(0x000000)
  scene.fog = new FogExp2(0x09090f, 0.08)

  const camera = new PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 7)

  const renderer = new WebGLRenderer({
    canvas: canvas.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(root.value.clientWidth, root.value.clientHeight)
  renderer.setClearColor(0x000000, 0)

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const ambient = new AmbientLight(0xffffff, 0.9)
  scene.add(ambient)

  const keyLight = new DirectionalLight(0x9f7aea, 1.35)
  keyLight.position.set(4.5, 4, 6)
  scene.add(keyLight)

  const fillLight = new DirectionalLight(0x38bdf8, 0.45)
  fillLight.position.set(-4, -2, 4)
  scene.add(fillLight)

  const rimLight = new DirectionalLight(0xf8fafc, 0.35)
  rimLight.position.set(-2, 4, -3)
  scene.add(rimLight)

  const glowLight = new PointLight(0xc084fc, 1.8, 18)
  glowLight.position.set(1.8, 1.2, 4.2)
  scene.add(glowLight)

  const sphere = new Mesh(
    new SphereGeometry(1.55, 48, 48),
    new MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.45,
      roughness: 0.25,
      emissive: 0x1e1037,
      emissiveIntensity: 0.45
    })
  )
  sphere.position.set(-0.8, -0.2, 0)
  scene.add(sphere)

  const halo = new Mesh(
    new SphereGeometry(2.1, 48, 48),
    new MeshStandardMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.12,
      metalness: 0.1,
      roughness: 0.9,
      emissive: 0x2e1065,
      emissiveIntensity: 0.8
    })
  )
  halo.position.copy(sphere.position)
  scene.add(halo)

  const pointsGeometry = new BufferGeometry()
  const particleCount = 420
  const particleDensity = isMobile ? 180 : particleCount
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleDensity; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16
  }
  pointsGeometry.setAttribute('position', new Float32BufferAttribute(positions.slice(0, particleDensity * 3), 3))

  const particles = new Points(
    pointsGeometry,
    new PointsMaterial({
      color: 0xffffff,
      size: isMobile ? 0.028 : 0.035,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: AdditiveBlending
    })
  )
  scene.add(particles)

  const glowRing = new Mesh(
    new SphereGeometry(2.9, 48, 48),
    new MeshStandardMaterial({
      color: 0x312e81,
      transparent: true,
      opacity: 0.08,
      roughness: 1,
      metalness: 0,
      emissive: 0x4338ca,
      emissiveIntensity: 0.4
    })
  )
  glowRing.rotation.x = 0.7
  scene.add(glowRing)

  let mouseX = 0
  let mouseY = 0
  let rafId = 0
  let time = 0

  const onPointerMove = (event: PointerEvent) => {
    const rect = root.value!.getBoundingClientRect()
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1
  }

  const onResize = () => {
    if (!root.value) return
    const width = root.value.clientWidth
    const height = root.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const animate = () => {
    rafId = window.requestAnimationFrame(animate)
    time += 0.01

    const cameraTargetX = mouseX * 0.4
    const cameraTargetY = -mouseY * 0.25
    camera.position.x += (cameraTargetX - camera.position.x) * 0.05
    camera.position.y += (cameraTargetY - camera.position.y) * 0.05
    camera.position.z += (6.3 - camera.position.z) * 0.02
    camera.lookAt(0, 0, 0)

    sphere.rotation.y += 0.0045
    sphere.rotation.x += 0.0018
    sphere.position.y = -0.2 + Math.sin(time * 1.4) * 0.04

    halo.rotation.y -= 0.0012
    halo.position.y = sphere.position.y

    glowLight.intensity = 1.55 + Math.sin(time * 1.9) * 0.15

    particles.rotation.y += 0.0006
    particles.rotation.x += 0.00015
    particles.position.y = Math.sin(time * 0.6) * 0.05

    keyLight.intensity = 1.28 + Math.sin(time * 0.8) * 0.06
    rimLight.intensity = 0.33 + Math.cos(time * 1.1) * 0.04

    renderer.render(scene, camera)
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  onResize()
  if (prefersReducedMotion) {
    root.value.style.opacity = '1'
    renderer.render(scene, camera)
  } else {
    gsap.fromTo(
      root.value,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo(
      [sphere.scale, halo.scale],
      { x: 0.7, y: 0.7, z: 0.7 },
      { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power3.out', stagger: 0.06 }
    )
    gsap.fromTo(
      [ambient, keyLight, fillLight, rimLight, glowLight],
      { intensity: 0 },
      {
        intensity: (index: number, target: any) => {
          if (target === ambient) return 0.9
          if (target === keyLight) return 1.35
          if (target === fillLight) return 0.45
          if (target === rimLight) return 0.35
          return 1.8
        },
        duration: 1.35,
        ease: 'power2.out'
      }
    )
    animate()
  }

  cleanup = () => {
    window.cancelAnimationFrame(rafId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    pointsGeometry.dispose()
    sphere.geometry.dispose()
    halo.geometry.dispose()
    glowRing.geometry.dispose()
    disposeIfPossible(sphere.material)
    disposeIfPossible(halo.material)
    disposeIfPossible(glowRing.material)
    disposeIfPossible(particles.material)
  }
})

onBeforeUnmount(() => {
  cleanup?.()
})
</script>
