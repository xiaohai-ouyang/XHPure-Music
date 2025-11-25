<template>
  <div
    class="myNav"
    :class="{ myNavContracted: pageStatusStore.isNavContracted }"
    @click="pageStatusStore.isPlayQueueShow = false"
  >
    <nav>
      <ThemeSwitch />
      <NavigationMenu :current-page-title="pageStatusStore.currentPageTitle" />
      <UserPlaylists />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { usePageStatusStore } from '@/stores/pageStatusStores'
import ThemeSwitch from './ThemeSwitch.vue'
import NavigationMenu from './NavigationMenu.vue'
import UserPlaylists from './UserPlaylists.vue'

const pageStatusStore = usePageStatusStore()
</script>

<style scoped lang="less">
.myNav {
  width: 200px;
  transition: width 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  box-shadow: 0 0 0 @lightMode-shadow-color;
  background: @lightMode-nav-bgColor;
}

nav {
  .col-flex(@align: center;);
  padding: 20px 10px;
  height: 100vh;
  width: 200px;
}

.iconfont {
  font-size: 35px;
}

.myNavContracted {
  width: 0;
}
</style>
