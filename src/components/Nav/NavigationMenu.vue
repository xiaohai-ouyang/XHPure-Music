<template>
  <div class="navigator">
    <div class="navItem-container">
      <router-link
        class="nav-item"
        :class="{ active: currentPageTitle === '歌曲' }"
        to="/page/music"
      >
        <i class="iconfont">&#xe725;</i>
        <p class="nav-item-name">歌曲</p>
      </router-link>
      <router-link
        class="nav-item"
        :class="{ active: currentPageTitle === '歌单' }"
        to="/page/playlists"
      >
        <i class="iconfont">&#xe71f;</i>
        <p class="nav-item-name">歌单</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPageTitle: string
}>()
</script>

<style scoped lang="less">
.active {
  color: @lightMode-nav-activeColor !important;
}

.navigator {
  margin-top: 20px;
  border-radius: @nav-borderRadius;
  background: white;
}

.navItem-container,
.user-playlist-container {
  .col-flex(@justify: flex-start);
  width: 100%;
  padding: 2px;
}

.nav-item {
  .row-flex(@justify: flex-start, @align: center);
  height: 40px;
  color: @lightMode-nav-activeColor;
  text-decoration: none;
  padding: 5px 25px 5px 30px;
  width: 100%;
  gap: 20px;
  transition: all 0.2s;
  border-radius: @nav-borderRadius;
  white-space: nowrap;

  &:hover {
    background: @lightMode-nav-hoverColor;
  }
}

.nav-item-name {
  font-weight: 600;
  white-space: nowrap;
}

i {
  font-size: 28px;
}
</style>
