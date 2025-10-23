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

  .nav-item-name {
    font-weight: 600;
  }

}

.navigator {
  margin-top: 20px;
  width: 100%;
  border-radius: @nav-borderRadius;
  background: white;
}

.navItem-container {
  .col-flex(@justify: flex-start);
  width: 100%;
  padding: 2px;
}

.nav-item {
  .row-flex(@align: center);
  height: 40px;
  color: #333;
  text-decoration: none;
  padding: 5px 30px;
  width: 100%;
  transition: all 0.2s ease;
  border-radius: @nav-borderRadius;
  white-space: nowrap;

  &:hover {
    background: @lightMode-nav-hoverColor;
  }

  i, p {
    flex: 1;
    text-align: center;
  }
}

.nav-item-name {
  white-space: nowrap;
}

i {
  font-size: 30px;
}
</style>
