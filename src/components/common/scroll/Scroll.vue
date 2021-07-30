<template>
  <!-- 给元素绑定ref用来获得元素 -->
  <div class="wrapper" ref="wrapper">
    <!-- 插槽用class包裹 -->
    <!-- 一个wrapper，一个content【模块要求】 -->
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import BScroll from "better-scroll";
export default {
  name: "Scroll",
  props: {
    // 父给子传参，监听滚动，不一定需要，所以需要props父传参
    probeType: {
      type: Number,
      default: 0,
    },
    // 上拉加载更多，不一定需要
    pullUpLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      scroll: null,
      message: "哈哈哈",
    };
  },
  //   dom创建后，生命周期函数mounted（）
  mounted() {
    //
    // 1.创建BScroll对象

    // this.$refs.wrapper，不要用query，不准确
    // 并且把对象给这个vue实例的scroll（data）
    // click等等是设置的参数
    this.scroll = new BScroll(this.$refs.wrapper, {
      click: true,
      probeType: this.probeType,
      pullUpLoad: this.pullUpLoad,
    });
    //
    // 2.监听滚动的位置，子给父传
    this.scroll.on("scroll", (position) => {
      // console.log(position);
      this.$emit("scroll", position);
    });
    //
    // 3.监听上拉事件，子给父传
    this.scroll.on("pullingUp", () => {
      this.$emit("pullingUp");
    });
  },
  methods: {
    //   父组件homevue调用
    // es6：默认值300ms滚到顶部（如果x=y=0）
    scrollTo(x, y, time = 300) {
      this.scroll.scrollTo(x, y, time);
    },
    finishPullUp() {
      this.scroll.finishPullUp();
    },
  },
};
</script>

<style scoped>
</style>