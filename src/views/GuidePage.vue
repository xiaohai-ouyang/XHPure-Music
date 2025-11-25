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
  background-color: #f0f2f5;

  h1 {
    margin-bottom: 20px;
    color: #333;
  }

  p {
    margin-bottom: 30px;
    color: #666;
  }

  .back-btn {
    padding: 10px 20px;
    background-color: #002fa7;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s;

    &:hover {
      background-color: darken(#002fa7, 10%);
    }
  }
}
</style>
