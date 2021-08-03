<template>
  <div id="detail">
    <!-- navbar样式有改动，重新定义一个detailnavbar里放navbar更改样式 -->
    <detail-nav-bar class="detail-nav" />
    <!-- 注意topimages驼峰短线 -->
    <!-- 还是用betterscroll做滚动 -->
    <!-- 把数据传给各个components -->
    <!-- content类用来给scroll高度，必须给高度才能用betterscroll -->
    <scroll class="content" ref="scroll">
      <detail-swiper :top-images="topImages" />
      <!--  detailbaseinfo.vue ：商品基本信息展示 -->
      <detail-base-info :goods="goods" />
      <!-- detail-shop-info.VUE  店铺信息的展示 -->
      <detail-shop-info :shop="shop" />
      <!-- 图片全部加载完毕，子函数发送imageload事件到父组件，
      父组件监听到事件调用方法，控制scroll refresh重新计算滚动高度，
      发送事件：【只发送一次 】通过watch监听属性变化-->
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad" />
      <detail-param-info :param-info="paramInfo" />
      <detail-comment-info :comment-info="commentInfo" />
      <!-- 复用goodslist展示推荐数据 -->
      <goods-list :goods="recommends" />
    </scroll>
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar.vue";
import DetailSwiper from "./childComps/DetailSwiper.vue";
// baseinfo模块重点：数据整合
import DetailBaseInfo from "./childComps/DetailBaseInfo.vue";
import DetailShopInfo from "./childComps/DetailShopInfo.vue";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";

import Scroll from "components/common/scroll/Scroll";
import GoodsList from "components/content/goods/GoodsList";

import { imgListenerMixin } from "common/mixin.js";
// goods 封装类
import {
  getDetail,
  getRecommend,
  Goods,
  Shop,
  GoodsParam,
} from "network/detail.js";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    Scroll,
    GoodsList,
  },
  data() {
    return {
      iid: null,
      // topimages-》array
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      //此处可mixin
      // itemImgListener: null,
    };
  },
  // 混入mixin
  mixins: [imgListenerMixin],
  methods: {
    imageLoad() {
      this.$refs.scroll.refresh();
    },
  },

  //   生命周期函数created()
  created() {
    //   从路径url传来的参数iid 保存到vue实例的data里
    this.iid = this.$route.params.iid;
    // 从detail.js 【【获得数据】】方法 getDetail
    getDetail(this.iid).then((res) => {
      // console.log(res);
      const data = res.result;
      // 1. 获取顶部轮播图数据  封装一个swipers展示这六张图片
      this.topImages = data.itemInfo.topImages;
      // 2.获取商品信息，goods封装类来自detail.js
      this.goods = new Goods(
        data.itemInfo,
        data.columns,
        data.shopInfo.services
      );
      // 3.创建店铺信息的对象
      this.shop = new Shop(data.shopInfo);
      // 4.保存商品的详情数据[没写类]
      this.detailInfo = data.detailInfo;
      // 5.获取参数的信息
      this.paramInfo = new GoodsParam(
        data.itemParams.info,
        data.itemParams.rule
      );
      //6.获取评论信息第一条,有些没有
      if (data.cRate !== 0) {
        this.commentInfo = data.rate.list[0];
      }
    });
    // 7.获取推荐数据
    // 复用goodslist
    getRecommend().then((res) => {
      this.recommends = res.data.list;
    });
  },
  // mounted上监听事件总线的imgload事件，调用scroll的refresh方法，重新计算高度，scroll滚动【同homevue】
  mounted() {},
  // 没有对 Detail 组件keep-alive，所以在离开组件时取消图片加载事件的监听，要用 destroyed() 生命周期函数取消事件
  destroyed() {
    // 离开组件时取消图片加载监听事件
    this.$bus.$off("itemImageLoad", this.itemImgListener);
  },
};
</script>

<style scoped>
#detail {
  position: relative;
  z-index: 9;
  background-color: #fff;
  height: 100vh;
}

.detail-nav {
  position: relative;
  z-index: 9;
  background-color: #fff;
}
/* 一定要给scroll设置高度才能滚动！ */
/* 或者left right bottom =0 */
/* 100% 相对父亲高度 */
.content {
  /* height: 300px; */
  height: calc(100% - 44px);
}
</style>