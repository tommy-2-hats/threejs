import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export default class HomePageScene {
  constructor(canvasId = 'animation-0') {
    this.canvasId = canvasId
    this.scene = null
    this.camera = null
    this.renderer = null
    this.composer = null // Add composer property
    this.text = null
    this.animationId = null
    this.clock = new THREE.Clock()
  }

  init() {
    // Get canvas
    const canvas = document.getElementById(this.canvasId)
    if (!canvas) {
      console.error(`Canvas with id ${this.canvasId} not found`)
      return
    }

    // Create scene
    this.scene = new THREE.Scene()

    // Create camera
    const fov = 75
    const aspect = canvas.clientWidth / canvas.clientHeight
    const near = 0.1
    const far = 1000
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.z = 1.75

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Set up post-processing
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    const effect1 = new ShaderPass(DotScreenShader)
    effect1.uniforms['scale'].value = 4
    this.composer.addPass(effect1)

    const effect2 = new ShaderPass(RGBShiftShader)
    effect2.uniforms['amount'].value = 0.0015
    this.composer.addPass(effect2)

    const effect3 = new OutputPass()
    this.composer.addPass(effect3)

    // Create text as a texture on a plane
    this.createTextPlane()

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(2, 3, 4)
    this.scene.add(pointLight)

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this))

    // Start animation loop
    this.animate()
  }

  createTextPlane() {
    // Create a canvas texture for the text
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 512
    canvas.height = 128

    // Clear background
    context.fillStyle = 'rgba(0,0,0,0)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw text
    context.font = 'bold 80px Arial'
    context.fillStyle = '#1900ff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Buggin Out!', canvas.width / 2, canvas.height / 2)

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)

    // Create a plane with the texture
    const geometry = new THREE.PlaneGeometry(4, 1)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    })

    this.text = new THREE.Mesh(geometry, material)
    this.scene.add(this.text)
  }

  handleResize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false)
      this.composer.setSize(width, height) // Add this line
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this))

    // Animate the text if it's loaded
    if (this.text) {
      const elapsedTime = this.clock.getElapsedTime()
      this.text.rotation.y = Math.sin(elapsedTime * 0.5) * 0.3
    }

    // Use composer instead of renderer
    this.composer.render()
  }

  destroy() {
    // Stop animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResizeBound)

    // Clear scene
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
}
