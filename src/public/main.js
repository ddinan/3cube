import * as THREE from 'three'

import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

let camera, scene, renderer, controls

const objects = []

let raycaster

let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let canJump = false

let prevTime = performance.now()
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()
const vertex = new THREE.Vector3()
const color = new THREE.Color()

init()

function init () {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.y = 10

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  scene.fog = new THREE.Fog(0xffffff, 0, 750)

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5)
  light.position.set(0.5, 1, 0.75)
  scene.add(light)

  controls = new PointerLockControls(camera, document.body)

  const blocker = document.getElementById('blocker')
  const instructions = document.getElementById('instructions')

  instructions.addEventListener('click', function () {
    controls.lock()
  })

  controls.addEventListener('lock', function () {
    instructions.style.display = 'none'
    blocker.style.display = 'none'
  })

  controls.addEventListener('unlock', function () {
    blocker.style.display = 'block'
    instructions.style.display = ''
  })

  scene.add(controls.object)

  const onKeyDown = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true
        break

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true
        break

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true
        break

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true
        break

      case 'KeyE':
        if (canJump === true) velocity.y += 350
        canJump = false
        break
    }
  }

  const onKeyUp = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false
        break

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false
        break

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false
        break

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false
        break
    }
  }

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10)

  // floor

  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100)
  floorGeometry.rotateX(-Math.PI / 2)

  // vertex displacement

  let position = floorGeometry.attributes.position

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)

    vertex.x += Math.random() * 20 - 10
    vertex.y += Math.random() * 2
    vertex.z += Math.random() * 20 - 10

    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  floorGeometry = floorGeometry.toNonIndexed() // ensure each face has unique vertices

  position = floorGeometry.attributes.position
  const colorsFloor = []

  for (let i = 0, l = position.count; i < l; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace)
    colorsFloor.push(color.r, color.g, color.b)
  }

  floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3))

  const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })

  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  scene.add(floor)

  // objects

  const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed()

  position = boxGeometry.attributes.position
  const colorsBox = []

  for (let i = 0, l = position.count; i < l; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace)
    colorsBox.push(color.r, color.g, color.b)
  }

  boxGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3))

  for (let i = 0; i < 500; i++) {
    const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true })
    boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace)

    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.x = Math.floor(Math.random() * 20 - 10) * 20
    box.position.y = Math.floor(Math.random() * 20) * 20 + 10
    box.position.z = Math.floor(Math.random() * 20 - 10) * 20

    scene.add(box)
    objects.push(box)
  }

  //

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  document.body.appendChild(renderer.domElement)

  //

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate () {
  const time = performance.now()

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.object.position)
    raycaster.ray.origin.y -= 10

    const intersections = raycaster.intersectObjects(objects, false)

    const onObject = intersections.length > 0

    const delta = (time - prevTime) / 1000

    velocity.x -= velocity.x * 10.0 * delta
    velocity.z -= velocity.z * 10.0 * delta

    velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward)
    direction.x = Number(moveRight) - Number(moveLeft)
    direction.normalize() // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y)
      canJump = true
    }

    controls.moveRight(-velocity.x * delta)
    controls.moveForward(-velocity.z * delta)

    controls.object.position.y += (velocity.y * delta) // new behavior

    if (controls.object.position.y < 10) {
      velocity.y = 0
      controls.object.position.y = 10

      canJump = true
    }
  }

  prevTime = time

  renderer.render(scene, camera)
}
