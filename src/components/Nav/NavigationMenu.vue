<template>
  <div class="navigator">
    <div class="nav-item-container">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        class="nav-item"
        :class="{ active: currentPageTitle === item.name }"
        :to="item.path"
      >
        <i class="iconfont" v-html="item.icon"></i>
        <span class="nav-item-name">{{ item.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  name: string
  path: string
  icon: string
}

defineProps<{
  currentPageTitle: string
  navItems: NavItem[]
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

  * {
    flex: 1;
  }
}

.nav-item-name {
  white-space: nowrap;
}

i {
  font-size: 30px;
}
</style>
