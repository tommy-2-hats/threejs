<script setup>
import { onMounted, onUnmounted } from 'vue'
import HomePageScene from '../models/homePage.js'

let scene = null

onMounted(() => {
  scene = new HomePageScene('animation-0')
  scene.init()
})

onUnmounted(() => {
  if (scene) {
    scene.destroy()
    scene = null
  }
})
</script>

<template>
  <main>
    <header>
      <h1>Now...</h1>
      <h1>Mental!</h1>
      <h1 class="rotated-text">Right?</h1>
    </header>
  </main>
  <canvas class="canvas" id="animation-0"></canvas>
</template>
<style scoped>
header {
  margin-top: -9rem;
}
.rotated-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: translate(0.55rem, 0rem);
}
canvas {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: -1;
  margin-left: 35%;
  margin-top: 40vh;
  width: 65%;
  height: 60vh;
  /* background-color: rgb(4, 255, 0); */
}
</style>
