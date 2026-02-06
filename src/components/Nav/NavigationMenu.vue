<template>
  <div class="navigator">
    <div class="nav-item-container">
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

  .nav-item-name {
    font-weight: 600;
  }
}

.navigator {
  margin-top: 20px;
  width: 100%;
  border-radius: @nav-borderRadius;
  background: @lightMode-nav-bgItemColor;
}

.nav-item-container {
  .col-flex(@justify: flex-start);
  padding: 5px;
}

.nav-item {
  .row-flex(@align: center);
  height: 40px;
  color: @lightMode-text-main;
  text-decoration: none;
  padding: 5px 30px;
  width: 100%;
  transition: all 0.2s ease;
  border-radius: @nav-borderRadius;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: @lightMode-nav-hoverColor;
  }
}

.nav-item-name {
  white-space: nowrap;
}

i {
  font-size: 30px;
}
</style>
