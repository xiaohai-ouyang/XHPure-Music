<template>
  <div class="empty">
    <button @click="onPickMusic" class="add-to-list-btn">
      <span>添加音乐</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'pickMusic'): void
}

const emit = defineEmits<Emits>()

const onPickMusic = () => {
  emit('pickMusic')
}
</script>

<style lang="less" scoped>
.empty {
  .col-flex(@align:center, @justify: center);
  height: 100%;
  width: 100%;

  .add-to-list-btn {
    padding: 10px;
    color: white;
    background-color: @lightMode-dominant-textColor;
    font-weight: 700;
    font-size: 25px;
    border-radius: 10px;
  }
}
</style>
