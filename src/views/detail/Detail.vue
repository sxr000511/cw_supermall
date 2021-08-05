<template>
  <div id="detail">
    <!-- navbar样式有改动，重新定义一个detailnavbar里放navbar更改样式 -->
    <!-- [事件]监听@可以驼峰，[属性]短线连接 -->
    <!-- titleclick自动传参index -->
    <detail-nav-bar class="detail-nav" ref="nav" @titleClick="titleClick" />
    <!-- 注意topimages驼峰短线 -->
    <!-- 还是用betterscroll做滚动 -->
    <!-- 把数据传给各个components -->
    <!-- content类用来给scroll高度，必须给高度才能用betterscroll -->
    <!-- 监听scroll事件，事件处理方法contentscroll ,自动传入position-->
    <scroll
      class="content"
      ref="scroll"
      :probe-type="3"
      @scroll="contentScroll"
    >
      <detail-swiper :top-images="topImages" />
      <!--  detailbaseinfo.vue ：商品基本信息展示 -->
      <detail-base-info :goods="goods" />
      <!-- detail-shop-info.VUE  店铺信息的展示 -->
      <detail-shop-info :shop="shop" />
      <!-- 图片全部加载完毕，子函数发送imageload事件到父组件，
      父组件监听到事件调用方法，控制scroll refresh重新计算滚动高度，
      发送事件：【只发送一次 】通过watch监听属性变化-->
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad" />
      <detail-param-info ref="params" :param-info="paramInfo" />
      <detail-comment-info ref="comment" :comment-info="commentInfo" />
      <!-- 复用goodslist展示推荐数据 -->
      <goods-list ref="recommend" :goods="recommends" />
    </scroll>
    <!-- detailbuttombar传来点击添加购物车事件addtocart，调用事件处理函数addcart -->
    <detail-buttom-bar @addCart="addToCart" />
    <back-top @click.native="backClick" v-show="isShowBackTop" />
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
import DetailButtomBar from "./childComps/DetailButtomBar.vue";

import Scroll from "components/common/scroll/Scroll";
import GoodsList from "components/content/goods/GoodsList";
import BackTop from "components/content/backTop/BackTop";

import { imgListenerMixin } from "common/mixin.js";
// goods 封装类
import {
  getDetail,
  getRecommend,
  Goods,
  Shop,
  GoodsParam,
} from "network/detail.js";

import { debounce } from "common/utils.js";

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
    DetailButtomBar,
    BackTop,
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
      //此处mixin
      // itemImgListener: null,
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0,
      isShowBackTop: false,
    };
  },
  // 混入mixin
  mixins: [imgListenerMixin],
  methods: {
    imageLoad() {
      // 图片加载scroll重新计算
      this.$refs.scroll.refresh();
      //  图片加载，计算topy
      this.getThemeTopY();
    },
    // 点击让scroll跳转到对应的scrolly
    titleClick(index) {
      // console.log(index);
      // console.log(this.themeTopYs[index]);
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200);
    },
    backClick() {
      this.$refs.scroll.scrollTo(0, 0, 300);
    },
    // 滚动改变tab变红
    contentScroll(position) {
      // 用于返回顶部
      this.isShowBackTop = -position.y > 1000;
      // console.log(position);
      // 1.获取y值
      const positionY = -position.y;

      let length = this.themeTopYs.length;

      // 2.positionY和主题中的值进行对比
      // for (let i = 0; i < length; i++) {
      //   // 这样做 最后一种情况越界了
      //   // if(positionY > this.themeTopYs[i] && positionY < this.themeTopYs[i+1]){
      //   //   console.log(i)
      //   // }
      //   if (
      //     // this.currentIndex !== i  减少次数，只打印一次
      //     this.currentIndex !== i &&
      //     ((i < length - 1 &&
      //       positionY >= this.themeTopYs[i] &&
      //       positionY < this.themeTopYs[i + 1]) ||
      //       (i === length - 1 && positionY >= this.themeTopYs[i]))
      //   ) {
      //     this.currentIndex = i;
      //     // 把这个currentindex传入detailnavbar里面
      //     this.$refs.nav.currentIndex = this.currentIndex;
      //   }
      // }
      for (let i = 0; i < length - 1; i++) {
        if (
          this.currentIndex !== i &&
          i < length - 1 &&
          positionY >= this.themeTopYs[i] &&
          positionY < this.themeTopYs[i + 1]
        ) {
          this.currentIndex = i;
          console.log(i); // 因为此时打印非常频繁，所以将当前index保存为一个变量，在两个不等的情况下才打印，就不会很频繁
          console.log(this.themeTopYs[i]); // 此处的值是正值
          this.$refs.nav.currentIndex = this.currentIndex;
        }
      }
    },
    // 监听子组件点击，调用添加到购物车，通过vuex
    addToCart() {
      // console.log("addcart");
      // 1.获取购物车需要展示的信息，因为有多个信息，所以可以放在一个对象里
      const product = {};
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.newPrice;
      // id一定要传，因为id是商品的唯一标识，是将id传给服务器获取到对应的商品
      product.iid = this.iid;
      product.realPrice = this.goods.realPrice;

      // 2.将商品添加到购物车里
      // this.$store.cartList.push(product)  //不要这么做，对store中状态的修改要通过mutation
      // 直接通过mutation
      // console.log(product);
      // this.$store.commit("addCart", product);
      // mutations重构

      // this.$store.dispatch("addCart", product);
      // action返回promise  可以返回信息
      // this.$store.dispatch('addCart', product).then(res => {
      //   console.log(res)
      // })

      // ////////////////////////
      // // 通过vuex的action【 通过 .dispatch 】
      // 并且 【【toast 弹出】】
      this.$store.dispatch("addCart", product).then((res) => {
        this.$toast.show(res, 2000);
      });
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
    // 8.给getThemeTopY赋值，点击 navbar 跳转至相应位置，debounce防抖
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = [];
      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      this.themeTopYs.push(Number.MAX_VALUE); // 在数组末尾增加一个无限大的值，为了之后对数组做遍历
      // console.log(this.themeTopYs);
    }, 100);
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