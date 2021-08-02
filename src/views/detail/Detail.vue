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

import Scroll from "components/common/scroll/Scroll";

// goods 封装类
import { getDetail, Goods, Shop, GoodsParam } from "network/detail.js";
export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    Scroll,
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
    };
  },
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
    });
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