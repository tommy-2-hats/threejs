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
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  position: relative;
  z-index: 10; /* Ensure navbar is above other content */
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

.navbar-link:focus {
  outline: none; /* Remove default focus outline */
  border-bottom: 24px solid #1900ff; /* Reduced from 28px to 2px */
}
</style>
