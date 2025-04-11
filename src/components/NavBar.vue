<script setup>
const items = [
  { text: 'Home', to: '/' },
  { text: 'Animation 1', to: '/animation-1' },
  { text: 'Animation 2', to: '/animation-2' },
]
</script>

<template>
  <nav class="navbar">
    <div class="container-fluid">
      <div v-for="(item, index) in items" :key="index">
        <router-link :to="item.to">{{ item.text }}</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  /* background-color: #333; */
  display: flex;
  justify-content: flex-end;
}
.container-fluid {
  display: flex;
  gap: 1rem;
}
</style>
