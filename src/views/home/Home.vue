<template>
  <!-- 带-是因为html不识别驼峰 ,slot指定替换name,给navbar设置class 为了让该navbar在首页有自己的style-->
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">首页</div></nav-bar>
    <!-- swiper 和swiperitems 实现轮播图 swi里面有slot预留，在这个slot里插入，把图片轮播-->
    <home-swiper :banners="banners" />
    <recommend-view :recommends="recommends" />
  </div>
</template>

<script type="text/ecmascript-6">
import NavBar from "components/common/navbar/NavBar.vue";
import HomeSwiper from "./childComps/HomeSwiper.vue";
import RecommendView from "./childComps/RecommendView.vue";
// 面向home.js请求数据，home.js面向request.js，request.js 用axios
import { getHomeMultidata } from "network/home";

export default {
  name: "Home",
  // 引用组件
  components: { NavBar, HomeSwiper, RecommendView },
  data() {
    return {
      banners: [],
      recommends: [],
    };
  },
  // 生命周期函数 网络请求
  created() {
    getHomeMultidata().then((res) => {
      // 要通过data保存变量,this指向上一级，是这个对象

      // res被result引用了，不会被回收
      this.banners = res.data.banner.list;
      this.recommends = res.data.recommend.list;
      // console.log(this.recommends);
    });
  },
};
</script>

<style scoped>
.nav-bar {
  background-color: var(--color-tint);
}
</style>