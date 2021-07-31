<template>
  <swiper>
    <!-- 数组循环v-for 方法 -->
    <swiper-item v-for="(item, id) in banners" :key="id">
      <a :href="item.link">
        <img :src="item.image" alt="" @load="imageLoad" />
      </a> </swiper-item
  ></swiper>
</template>

<script>
import { Swiper, SwiperItem } from "components/common/swiper";

export default {
  name: "HomeSwiper",
  props: {
    //   父传子，此处子组件接收banners变量，要求类型array，默认【】，注意是Array大写
    banners: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    Swiper,
    SwiperItem,
  },
  methods: {
    imageLoad() {
      this.$emit("swiperImageLoad");
    },
  },
};
</script>

<style>
</style>