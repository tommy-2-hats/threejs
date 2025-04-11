<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AnimationOneScene from '../models/animationOne.js'
import PageHeader from '../components/PageHeader.vue'

let scene = null
const isVisible = ref(true)

onMounted(() => {
  scene = new AnimationOneScene('animation-1')
  scene.init()

  // Set timeout to fade out container after 8 seconds
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
    <PageHeader>
      <template #heading>This is animation one</template>
    </PageHeader>
  </div>
  <canvas class="canvas" id="animation-1"></canvas>
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100vh;
  margin: 0 auto;
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
