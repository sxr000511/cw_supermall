<template>
  <div class="recommend">
    <!-- 同样v-for数组生成元素，div在外面绑定样式recommenditem ，href 和src 被v-bind 绑定为item。link 和item.image -->
    <!-- recommends来自父组件，被props里的recommends接收，注意ARRAY 的A大写 -->
    <div
      v-for="(item, index) in recommends"
      :key="index"
      class="recommend-item"
    >
      <a :href="item.link">
        <img :src="item.image" alt="" />
        <div>{{ item.title }}</div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecommendView",
  props: {
    recommends: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>

<style scoped>
.recommend {
  display: flex;
  width: 100%;
  text-align: center;
  font-size: 12px;
  padding: 10px 0 20px;
  border-bottom: 10px solid #eee;
}
.recommend-item {
  /* 均分 */
  flex: 1;
}
.recommend-item img {
  width: 70px;
  height: 70px;
  margin-bottom: 10px;
}
</style>