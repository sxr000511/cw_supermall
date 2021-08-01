<template>
  <div class="goods">
    <!-- 从父组件Home。vue获得goods，props里定义goods，父向子传参 -->
    <!-- vfor遍历列表goods（列表goods，item是object对象），生成对应的一堆 goodlistitem-->
    <!-- goodlistitem没slot -->
    <goods-list-item v-for="(item, id) in goods" :goods-item="item" :key="id" />
  </div>
</template>

<script>
import GoodsListItem from "./GoodsListItem";
export default {
  name: "GoodsList",
  components: {
    GoodsListItem,
  },
  props: {
    goods: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>

<style scoped>
.goods {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 2px;
}
</style>