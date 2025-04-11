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
  /* gap: 1rem; */
}

.navbar-link {
  background-color: #1900ff; /* Slightly more opaque on hover */
  color: white; /* Change text color on hover */
  text-decoration: none;
  backdrop-filter: blur(100px); /* Add blur effect */
  -webkit-backdrop-filter: blur(100px); /* For Safari */
  padding: 1rem;
  font-size: 1.2rem;
  /* border-radius: 6px; Rounded corners */
  transition: all 0.3s ease; /* Smooth transition */
}

.navbar-link:hover {
  color: #1900ff;
  background-color: white; /* Semi-transparent background */
  transition: all 0.5s ease; /* Smooth transition */
}

.navbar-link:focus {
  outline: none; /* Remove default focus outline */
  border-bottom: 24px solid #1900ff; /* Fixed from 24px to 2px */
}
</style>
