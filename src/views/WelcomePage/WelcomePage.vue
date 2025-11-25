<template>
  <div class="welcome-page">
    <div class="page-logo">
      <img src="@/assets/images/XHPureMusic.jpg" class="logo" />
    </div>
    <h1 class="title">欢迎使用 XHPure Music</h1>
    <p class="desc">一款基于 Vue3 + Vite 的音乐播放器</p>
    <div class="next-btns">
      <router-link
        to="/page"
        class="btn enter-btn"
        :class="{ hover: btnHover === 'btn1' }"
        @mouseenter="btnHover = 'btn1'"
        >进入XHPure&nbsp;Music</router-link
      >
      <router-link
        to="/guide"
        class="btn guide-btn"
        :class="{ hover: btnHover === 'btn2' }"
        @mouseenter="btnHover = 'btn2'"
        >查看教程</router-link
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({
  name: 'WelcomePage',
})

const btnHover = ref('btn1')
</script>

<style scoped lang="less">
.welcome-page {
  .col-flex(@justify:center, @align:center);
  background-color: aliceblue;
  height: 100vh;
}

.welcome-page .logo {
  width: 300px;
  border-radius: 10%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.welcome-page .title {
  margin: 15px 0;
}
.welcome-page .desc {
  margin-bottom: 15px;
}

.next-btns {
  .row-flex(@justify:center, @align:center, @gap:30px);

  .btn {
    color: #002fa7;
    padding: 10px 15px;

    border-radius: 8px;
    background-color: @lightMode-secondary-bgColor;
    text-align: center;
    transition: all 0.1s ease-in-out;

    text-decoration: unset;
  }
}

.hover {
  font-weight: 700;
  transform: scale(1.15);
  box-shadow: 0px 0px 13px rgba(0, 0, 0, 0.1);
}
</style>
