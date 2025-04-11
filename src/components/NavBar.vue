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
        <router-link class="navbar-link" :to="item.to">{{ item.text }}</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 10px;
  /* background-color: #333; */
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  /* background-color: antiquewhite; */
}
.container-fluid {
  display: flex;
  gap: 1rem;
  /* background-color: aqua; */
  /* margin-top: 2rem; */
}
.navbar-link {
  color: #1900ff;
  text-decoration: none;
  padding: 1rem;
  font-size: 1.2rem;
  /* padding-top: 2rem; */
}
</style>
