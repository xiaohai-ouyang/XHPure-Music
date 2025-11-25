<template>
  <div class="guide-page">
    <h1>使用教程</h1>
    <p>教程内容正在编写中...</p>
    <router-link to="/welcome" class="back-btn">返回</router-link>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'GuidePage',
})
</script>

<style scoped lang="less">
.guide-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: @lightMode-dominant-bgColor;

  h1 {
    margin-bottom: 20px;
    color: @lightMode-text-main;
  }

  p {
    margin-bottom: 30px;
    color: @lightMode-text-sub;
  }

  .back-btn {
    padding: 10px 20px;
    background-color: @lightMode-dominant-textColor;
    color: @lightMode-text-on-primary;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s;

    &:hover {
      background-color: darken(@lightMode-dominant-textColor, 10%);
    }
  }
}
</style>
