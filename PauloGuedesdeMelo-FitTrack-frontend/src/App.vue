<template>
  <div class="app-layout">
    <TheNavbar />
    <div class="app-body">
      <TheSidebar />
      <main class="app-content">
        <router-view />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
import TheNavbar from './components/layout/TheNavbar.vue'
import TheSidebar from './components/layout/TheSidebar.vue'
import TheFooter from './components/layout/TheFooter.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-body {
  display: flex;
  flex: 1;
}
.app-content {
  flex: 1;
}
</style>
