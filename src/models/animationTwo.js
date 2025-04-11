import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export default class AnimationTwoScene {
  constructor(canvasId = 'animation-two') {
    this.canvasId = canvasId
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.animationId = null
    // Store bound methods to ensure same reference for event listeners
    this.handleResizeBound = this.handleResize.bind(this)
    this.animateBound = this.animate.bind(this)
  }

  async init() {
    // Get canvas
    const canvas = document.getElementById(this.canvasId)
    if (!canvas) {
      console.error(`Canvas with id ${this.canvasId} not found`)
      return
    }

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 5)
    this.camera.position.set(0.1, 0.05, 0.15)

    // Create scene
    this.scene = new THREE.Scene()

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.toneMappingExposure = 1

    // Set up environment
    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)

    this.scene.backgroundBlurriness = 0.5

    const env = pmremGenerator.fromScene(environment).texture
    this.scene.background = env
    this.scene.environment = env
    environment.dispose()

    // Load model - use a basic cube as fallback if model fails to load
    try {
      const loader = new GLTFLoader()
      // Try using a different path or use a simple fallback model
      const gltf = await loader.loadAsync('/models/gltf/DispersionTest.glb')
      this.scene.add(gltf.scene)
    } catch (error) {
      console.warn('Failed to load GLTF model, using fallback cube:', error)
      // Add a fallback cube
      const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05)
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        metalness: 0.9,
        roughness: 0.1,
      })
      const cube = new THREE.Mesh(geometry, material)
      this.scene.add(cube)
    }

    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 0.1
    this.controls.maxDistance = 10
    this.controls.target.set(0, 0, 0)
    this.controls.update()

    // Handle resize with bound method
    window.addEventListener('resize', this.handleResizeBound)

    // Start animation loop
    this.animate()
  }

  handleResize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animateBound)

    // Update controls
    this.controls.update()

    // Render scene
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // Remove event listeners using same reference
    window.removeEventListener('resize', this.handleResizeBound)

    // Dispose controls
    if (this.controls) {
      this.controls.dispose()
    }

    // Clean up scene
    if (this.scene) {
      while (this.scene.children.length > 0) {
        const object = this.scene.children[0]
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
        this.scene.remove(object)
      }
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose()
    }
  }
}
