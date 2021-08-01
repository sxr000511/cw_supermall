<template>
  <!-- 带-是因为html不识别驼峰 ,slot指定替换name,给navbar设置class 为了让该navbar在首页有自己的style-->
  <!-- 没有做防抖，因为没有数据请求 -->
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">首页</div></nav-bar>
    <!-- 标准流 额外的一个tabcontrol放在这里解决betterscroll带来的吸附问题，受istabfixed控制是否显示-->
    <tab-control
      :titles="['流行', '新款', '精选']"
      @tabClick="tabClick"
      ref="tabControl1"
      class="tab-control"
      v-show="isTabFixed"
    />
    <!-- probetype和pullupload都是父传子 ，传入参数决定是否监听滚动，是否上拉加载-->
    <!-- contentscroll是子传父，父组件contentscroll方法，父组件事件为sroll，监听子组件$emit的scroll事件  -->
    <!-- 在Vue中，我们不用获取dom节点，元素绑定ref之后，直接通过this.$refs即可调用，此处给scorll组件绑定ref为scroll，下面的方法用到了他 -->
    <!-- pullingup和scroll都是子组件传来的事件，父组件scroll监听，调用父组件的方法contentscroll 和loadmore -->
    <scroll
      class="content"
      ref="scroll"
      :probe-type="3"
      :pull-up-load="true"
      @scroll="contentScroll"
      @pullingUp="loadMore"
    >
      <!-- swiper新增监听swiperimageload，服务于sticktop效果，等swiper的images加载出来后获取top值 -->
      <!-- homeswipter父组件给子组件传参 ： -->
      <!-- swiper 和 swiperitems 实现轮播图 swi里面有slot预留，在这个slot里插入，把图片轮播-->
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad" />
      <recommend-view :recommends="recommends" />
      <feature-view />
      <!-- 解决betterscroll下吸顶效果的实现问题，用两个tabcontrol制造假动画 -->
      <!-- 子给父传，父监听子传来的tabclick事件，得知点击了哪个title，调用父的tabclick方法 ，:titles绑定变量-->
      <tab-control
        ref="tabControl2"
        :titles="['流行', '新款', '精选']"
        @tabClick="tabClick"
      />
      <!-- [计算属性]showgoods ，动态改变goodlist里的内容-->
      <good-list :goods="showGoods" />
    </scroll>
    <!-- 注释结束 -->
    <!-- 返回顶部的按钮backtop， naive 必须加，用来监听vue组件的click，是否显示受到变量控制，改变量受scroll滚动距离控制 -->
    <!-- homevue的backclick方法绑定在click事件，v-show受dataisshowbacktop控制 ，scroll的contentscroll控制这个变量-->
    <back-top @click.native="backClick" v-show="isShowBackTop" />
  </div>
</template>

<script type="text/ecmascript-6">
// content组件
import HomeSwiper from "./childComps/HomeSwiper.vue";
import RecommendView from "./childComps/RecommendView.vue";
import FeatureView from "./childComps/FeatureView.vue";
// common组件
import NavBar from "components/common/navbar/NavBar.vue";
import TabControl from "components/content/tabControl/TabControl";
import Scroll from "components/common/scroll/Scroll";

// 方法
//1. 面向home.js请求数据，home.js面向request.js，request.js 用axios
import { getHomeMultidata, getHomeGoods } from "network/home";
import GoodList from "components/content/goods/GoodsList.vue";
import BackTop from "components/content/backTop/BackTop";

// 注意顺序养成良好习惯
export default {
  name: "Home",
  // 引用组件
  components: {
    HomeSwiper,
    RecommendView,
    FeatureView,
    NavBar,
    TabControl,
    GoodList,
    BackTop,
    Scroll,
  },
  data() {
    return {
      banners: [],
      recommends: [],
      goods: {
        pop: { page: 0, list: [] },
        new: { page: 0, list: [] },
        sell: { page: 0, list: [] },
      },
      // 默认为pop页面
      currentType: "pop",
      isShowBackTop: false,
      isTabFixed: false,
      tabOffsetTop: 0,
      saveY: 0,
    };
  },
  // ////////////////////////////////////////////////////
  // vue实例的生命周期函数created（）， 网络请求，
  // 组件创建完成-》》created(), 挂载mounted（），activated，deactivated
  created() {
    // created里只写主要逻辑
    // 再包装一层，不要把methods里的方法写道这里，乱
    // 必须使用this才能在本vue实例里调用methods方法里的~~
    // 否则调用的使上面从外部引入的方法（因为同名）
    // /////////////////////////
    // 1.请求多个数据
    this.getHomeMultidata();
    // 2.请求商品数据
    // 第一次进入都请求一次
    this.getHomeGoods("pop");
    this.getHomeGoods("new");
    this.getHomeGoods("sell");
  },
  mounted() {
    // 3.事件总线监听goodslistitem的itemimageload 事件，每个img加载完毕都会发送itemimageload到事件总线
    // 非父组件home监听事件总线，调用子组件scroll的refresh方法去调用模块的refresh（），使scroll重新计算内部元素的高度【又封装了一层方法而已】
    // 【可以在这里直接调用refresh，但是不够美观】
    // this.$bus.$on("itemImageLoad", () => {
    //   // console.log("woshibus");
    //   this.$refs.scroll.refresh();
    // });
    // 防抖动：监听图片加载完成，
    //这里后面不要加小括号，是传入函数！！
    const refresh = this.debounce(this.$refs.scroll.refresh, 50);
    //  《《--debounce返回函数对象，refresh直接refresh（）可调用
    // 对监听的事件进行保存，方便离开home组件时取消此事件监听
    // 此处是闭包，引用，上面的局部变量refresh（）不会被销毁（debounce里的timer也是闭包不会被销毁）
    this.$bus.$on("itemImageLoad", () => {
      refresh();
    });
  },
  // saveY使商品goodslist跳转保存位置
  // 进入组件的生命周期函数
  activated() {
    // refresh方法，scroll.vue中
    this.$refs.scroll.refresh();
    // ref获得组件scroll，x不需要滚动为0，时间为0，saveY由上次保存取得
    this.$refs.scroll.scrollTo(0, this.saveY, 2);
  },
  // 离开组件的生命周期函数
  deactivated() {
    // 1.保存当前浏览的位置，scrollvue的getscrolly方法
    this.saveY = this.$refs.scroll.getScrollY();
    // 2. 取消全局事件监听，具体原因见下方
    // this.$bus.$off('itemImgLoad', this.itemImgListener)
  },
  computed: {
    showGoods() {
      // console.log(this.goods);
      // 计算属性根据currentype从本vue对象的goods数据里取出list返回
      // currenttype改变时计算属性自动更新【当计算属性依赖的其他状态发生变化时,会重新计算结果】
      return this.goods[this.currentType].list;
    },
  },
  // ////////////////////////////////////////////////////
  // 方法
  // /////////////////////////////////////////////////
  methods: {
    // 具体写方法
    /**
     * 事件监听相关的方法
     */
    // 点击了谁，改变homevue的currenttype，
    // currenttype动态决定
    tabClick(index) {
      switch (index) {
        case 0:
          this.currentType = "pop";
          break;
        case 1:
          this.currentType = "new";
          break;
        case 2:
          this.currentType = "sell";
          break;
      }
      // console.log(index);
      // homevue实例下改变组件的currentindex
      if (this.$refs.tabControl1 !== undefined) {
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      }
    },
    swiperImageLoad() {
      // $el 在vue里用于获取组件的dom元素，组件是没有offetop的，
      // 获取tabOffsetTop的offsetTop
      this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
    },

    // 点击回到顶部
    backClick() {
      // this.$refs.scroll指向scroll组件，调用scroll的方法scrollTo
      this.$refs.scroll.scrollTo(0, 0);
    },
    // 通过子组件传来的position决定homevue里是否显示scroll图标
    contentScroll(position) {
      // 决定返回按钮是否显示
      this.isShowBackTop = -position.y > 1000;
      // 改版istabfixed，决定是否吸顶
      this.isTabFixed = -position.y > this.tabOffsetTop;
      // console.log(this.tabOffsetTop);
      // console.log(this.isTabFixed);
    },
    // 上拉加载更多
    loadMore() {
      this.getHomeGoods(this.currentType);
    },
    // /////////////////////////////////////////////////////
    /**
     * 网络请求相关的方法
     */
    getHomeMultidata() {
      getHomeMultidata().then((res) => {
        // this.result = res;
        this.banners = res.data.banner.list;
        this.recommends = res.data.recommend.list;
      });
    },
    // type动态获取，不同的type来get不同的数据
    // gethomegoods改变homevue实例的goods，goods改变时引起计算属性的改变，使数据显示改变
    getHomeGoods(type) {
      // 再原来的page上加一，不要写死page
      const page = this.goods[type].page + 1;
      // 这里的gethomegoods使来自home.js的
      getHomeGoods(type, page).then((res) => {
        // 把一个数组的数据放到另一个数组里
        // 1：[es6] ...
        // 方法2：遍历数组
        // console.log(res.data);
        this.goods[type].list.push(...res.data.list);
        this.goods[type].page += 1;
        // 【上拉加载必须加上】此处使上拉加载更多的代码，必须要finish才能再次上拉加载，
        this.$refs.scroll.finishPullUp();
      });
    },
    // 防抖动debounce
    //func 什么函数 delay等多久
    debounce(func, delay) {
      let timer = null;
      return function (...args) {
        // 《《---...arg可以接收很多参数，不止一个
        //将之前timer清除重新计时
        if (timer) clearTimeout(timer);
        // 此处闭包，timer被if后面的timer引用，不会被销毁，会进入if判断
        //settimeout延时
        timer = setTimeout(() => {
          func.apply(this, args);
        }, delay);
      };
    },
  },
};
</script>

<style scoped>
#home {
  /* padding-top: 44px; */
  height: 100vh;
  position: relative;
}
.home-nav {
  background-color: var(--color-tint);
  color: #fff;
  /* position: fixed;
  left: 0;
  right: 0;
  top: 0;*/
  z-index: 9;
}
/* 原生sticiky实现吸顶不能在betterscroll下使用 */
/* .tab-control {
  position: sticky;
  top: 44px;
  z-index: 9;
} */
.tab-control {
  position: relative;
  z-index: 9;
  padding-top: 0;
}
.content {
  overflow: hidden;
  /* 让scorll在指定范围里滚动显示 */
  position: absolute;
  top: 44px;
  bottom: 49px;
  left: 0;
  right: 0;
}
</style>