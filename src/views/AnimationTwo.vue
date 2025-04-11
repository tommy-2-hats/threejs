<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AnimationTwoScene from '../models/animationTwo.js'

let scene = null
const isVisible = ref(true)

onMounted(async () => {
  scene = new AnimationTwoScene('animation-two')
  await scene.init()

  setTimeout(() => {
    isVisible.value = false
  }, 1000)
})

onUnmounted(() => {
  if (scene) {
    scene.destroy()
    scene = null
  }
})
</script>

<template>
  <div class="container" :class="{ 'fade-out': !isVisible }">
    <h1>This is animation two.</h1>
  </div>
  <canvas class="canvas" id="animation-two"></canvas>
</template>

<style scoped>
.canvas {
  width: 80%;
  height: auto;
  background-color: rgb(247, 140, 0);
}

.container {
  opacity: 1;
  transition:
    opacity 1.8s ease-out,
    visibility 0s linear 1.8s;
  position: relative;
  z-index: 1;
}

.fade-out {
  opacity: 0;
  visibility: hidden;
  pointer-events: none; /* Prevents interaction with invisible content */
}
</style>
