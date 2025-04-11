import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class HomePageScene {
  constructor(canvasId = 'animation-0') {
    this.canvasId = canvasId
    this.scene = null
    this.camera = null
    this.renderer = null
    this.moonModel = null
    this.animationId = null
    this.clock = new THREE.Clock()
    this.handleResizeBound = this.handleResize.bind(this)
  }

  async init() {
    // Get canvas
    const canvas = document.getElementById(this.canvasId)
    if (!canvas) {
      console.error(`Canvas with id ${this.canvasId} not found`)
      return
    }

    // Create scene
    this.scene = new THREE.Scene()

    // Add dense bright blue fog
    const fogColor = new THREE.Color(0x1900ff) // Bright blue color matching your theme
    const fogDensity = 0.015 // Higher values make fog denser
    this.scene.fog = new THREE.FogExp2(fogColor, fogDensity)

    // Create camera
    const fov = 10
    const aspect = canvas.clientWidth / canvas.clientHeight
    const near = 0.0001
    const far = 100000000
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.set(1.5, -4, 4)

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0) // Transparent background

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(1, 1, 1)
    this.scene.add(directionalLight)

    // Add a soft point light to enhance details
    const pointLight = new THREE.PointLight(0xadd8e6, 1.5)
    pointLight.position.set(5, 3, 5)
    this.scene.add(pointLight)

    // Load moon model
    await this.loadMoonModel()

    // Handle resize
    window.addEventListener('resize', this.handleResizeBound)

    // Start animation loop
    this.animate()
  }

  async loadMoonModel() {
    try {
      // Set up draco loader
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/') // Path to draco decoder

      // Create and configure GLTF loader
      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)

      // Load the model
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          '/src/assets/3d/rantai.glb', // Path to your model
          resolve,
          undefined,
          reject,
        )
      })

      this.moonModel = gltf.scene

      // Center the model and scale it appropriately
      const box = new THREE.Box3().setFromObject(this.moonModel)
      const center = box.getCenter(new THREE.Vector3())
      this.moonModel.position.x -= center.x
      this.moonModel.position.y -= center.y
      this.moonModel.position.z -= center.z

      // Scale model to a reasonable size
      const size = box.getSize(new THREE.Vector3()).length()
      const scale = 2 / size
      this.moonModel.scale.set(scale, scale, scale)

      this.scene.add(this.moonModel)
    } catch (error) {
      console.error('Failed to load moon model:', error)
      // Create a fallback sphere if model loading fails
      const geometry = new THREE.SphereGeometry(1, 32, 32)
      const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.7,
        metalness: 0.1,
      })
      this.moonModel = new THREE.Mesh(geometry, material)
      this.scene.add(this.moonModel)
    }
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
    this.animationId = requestAnimationFrame(this.animate.bind(this))

    const elapsedTime = this.clock.getElapsedTime()

    // Rotate the moon model
    if (this.moonModel) {
      this.moonModel.rotation.y = elapsedTime * 1 // Slow rotation
      this.moonModel.rotation.z = elapsedTime * 1
    }

    // Direct rendering without post-processing
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    window.removeEventListener('resize', this.handleResizeBound)

    // Clean up scene
    while (this.scene && this.scene.children.length > 0) {
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

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose()
    }
  }
}
