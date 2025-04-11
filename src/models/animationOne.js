import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { radixSort } from 'three/examples/jsm/utils/SortUtils.js'

export default class AnimationOneScene {
  constructor(canvasId = 'animation-1') {
    this.canvasId = canvasId
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.mesh = null
    this.material = null
    this.geometries = []
    this.ids = []
    this.animationId = null
    this.matrix = new THREE.Matrix4()

    // Settings
    this.settings = {
      method: 'BATCHED', // 'BATCHED' or 'NAIVE'
      count: 256,
      dynamic: 16,
      sortObjects: true,
      perObjectFrustumCulled: true,
      opacity: 1,
      useCustomSort: true,
    }

    // Helper variables
    this.position = new THREE.Vector3()
    this.rotation = new THREE.Euler()
    this.quaternion = new THREE.Quaternion()
    this.scale = new THREE.Vector3()

    // Constants
    this.MAX_GEOMETRY_COUNT = 20000
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
    this.scene.background = new THREE.Color(0xffffff)

    // Create camera
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 100)
    this.camera.position.z = 30

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height)

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 1.0

    // Initialize geometries
    this.initGeometries()

    // Initialize mesh
    this.initMesh()

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this))

    // Start animation loop
    this.animate()
  }

  randomizeMatrix(matrix) {
    this.position.x = Math.random() * 40 - 20
    this.position.y = Math.random() * 40 - 20
    this.position.z = Math.random() * 40 - 20

    this.rotation.x = Math.random() * 2 * Math.PI
    this.rotation.y = Math.random() * 2 * Math.PI
    this.rotation.z = Math.random() * 2 * Math.PI

    this.quaternion.setFromEuler(this.rotation)

    this.scale.x = this.scale.y = this.scale.z = 0.5 + Math.random() * 0.5

    return matrix.compose(this.position, this.quaternion, this.scale)
  }

  randomizeRotationSpeed(rotation) {
    rotation.x = Math.random() * 0.01
    rotation.y = Math.random() * 0.01
    rotation.z = Math.random() * 0.01
    return rotation
  }

  initGeometries() {
    this.geometries = [
      new THREE.ConeGeometry(1.0, 2.0),
      new THREE.BoxGeometry(2.0, 2.0, 2.0),
      new THREE.SphereGeometry(1.0, 16, 8),
    ]
  }

  createMaterial() {
    if (!this.material) {
      this.material = new THREE.MeshNormalMaterial()
    }
    return this.material
  }

  cleanup() {
    if (this.mesh) {
      this.mesh.parent.remove(this.mesh)
      if (this.mesh.dispose) {
        this.mesh.dispose()
      }
    }
  }

  initMesh() {
    this.cleanup()

    if (this.settings.method === 'BATCHED') {
      this.initBatchedMesh()
    } else {
      this.initRegularMesh()
    }
  }

  initRegularMesh() {
    this.mesh = new THREE.Group()
    const material = this.createMaterial()

    for (let i = 0; i < this.settings.count; i++) {
      const child = new THREE.Mesh(this.geometries[i % this.geometries.length], material)
      this.randomizeMatrix(child.matrix)
      child.matrix.decompose(child.position, child.quaternion, child.scale)
      child.userData.rotationSpeed = this.randomizeRotationSpeed(new THREE.Euler())
      this.mesh.add(child)
    }

    this.scene.add(this.mesh)
  }

  initBatchedMesh() {
    const geometryCount = this.settings.count
    const vertexCount = this.geometries.length * 512
    const indexCount = this.geometries.length * 1024

    const euler = new THREE.Euler()
    const matrix = new THREE.Matrix4()
    this.mesh = new THREE.BatchedMesh(geometryCount, vertexCount, indexCount, this.createMaterial())
    this.mesh.userData.rotationSpeeds = []

    // disable full-object frustum culling since all of the objects can be dynamic
    this.mesh.frustumCulled = false

    this.ids.length = 0

    const geometryIds = [
      this.mesh.addGeometry(this.geometries[0]),
      this.mesh.addGeometry(this.geometries[1]),
      this.mesh.addGeometry(this.geometries[2]),
    ]

    for (let i = 0; i < this.settings.count; i++) {
      const id = this.mesh.addInstance(geometryIds[i % geometryIds.length])
      this.mesh.setMatrixAt(id, this.randomizeMatrix(matrix))

      const rotationMatrix = new THREE.Matrix4()
      rotationMatrix.makeRotationFromEuler(this.randomizeRotationSpeed(euler))
      this.mesh.userData.rotationSpeeds.push(rotationMatrix)

      this.ids.push(id)
    }

    this.scene.add(this.mesh)
  }

  sortFunction(list) {
    // initialize options
    this._options = this._options || {
      get: (el) => el.z,
      aux: Array.from({ length: this.maxInstanceCount }),
    }

    const options = this._options
    options.reversed = this.material.transparent

    let minZ = Infinity
    let maxZ = -Infinity
    for (let i = 0, l = list.length; i < l; i++) {
      const z = list[i].z
      if (z > maxZ) maxZ = z
      if (z < minZ) minZ = z
    }

    // convert depth to unsigned 32 bit range
    const depthDelta = maxZ - minZ
    const factor = (2 ** 32 - 1) / depthDelta // UINT32_MAX / z range
    for (let i = 0, l = list.length; i < l; i++) {
      list[i].z -= minZ
      list[i].z *= factor
    }

    // perform a fast-sort using the hybrid radix sort function
    radixSort(list, options)
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
    this.animateMeshes()
    this.controls.update()
    this.render()
  }

  animateMeshes() {
    const loopNum = Math.min(this.settings.count, this.settings.dynamic)

    if (this.settings.method === 'BATCHED') {
      for (let i = 0; i < loopNum; i++) {
        const rotationMatrix = this.mesh.userData.rotationSpeeds[i]
        const id = this.ids[i]

        this.mesh.getMatrixAt(id, this.matrix)
        this.matrix.multiply(rotationMatrix)
        this.mesh.setMatrixAt(id, this.matrix)
      }
    } else {
      for (let i = 0; i < loopNum; i++) {
        const child = this.mesh.children[i]
        const rotationSpeed = child.userData.rotationSpeed

        child.rotation.set(
          child.rotation.x + rotationSpeed.x,
          child.rotation.y + rotationSpeed.y,
          child.rotation.z + rotationSpeed.z,
        )
      }
    }
  }

  render() {
    if (this.mesh.isBatchedMesh) {
      this.mesh.sortObjects = this.settings.sortObjects
      this.mesh.perObjectFrustumCulled = this.settings.perObjectFrustumCulled
      this.mesh.setCustomSort(this.settings.useCustomSort ? this.sortFunction.bind(this) : null)
    }

    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    window.removeEventListener('resize', this.handleResizeBound)

    this.cleanup()

    if (this.controls) {
      this.controls.dispose()
    }

    // Clean up scene
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
