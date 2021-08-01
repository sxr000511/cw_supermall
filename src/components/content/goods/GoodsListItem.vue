<template>
  <div class="goods-item" @click="itemClick">
    <!-- goodsitem是对象 -->
    <!-- goodsitem由父goodslist传参goodsitem而来 -->
    <!-- src属性动态绑定goodsitem的show的img属性 -->
    <!-- @load监听img加载 ，加载完成调用imageload方法，发射事件到事件总线$bus上-->
    <img :src="goodsItem.show.img" alt="" @load="imageLoad" />
    <div class="goods-info">
      <p>{{ goodsItem.title }}</p>
      <span class="price">{{ goodsItem.price }}</span>
      <span class="collect">{{ goodsItem.cfav }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "GoodsListItem",
  props: {
    goodsItem: {
      // 父组件goodslist获得每一个对象objtct
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
    // goodslist加载完成，利用事件总线发出事件, 首页在created开始监听（创建好了就监听）
    imageLoad() {
      this.$bus.$emit("itemImageLoad");
    },
    itemClick() {
      // 点击goodslistitem ，路由跳转,用push不用replace，因为需要返回
      // 路由传参将iid传给detail.vue，让detail向服务器发请求，保存数据，
      // this.$router.push("/detail");
      // 1.【传参】动态路由  iid 商品id
      this.$router.push("/detail/" + this.goodsItem.iid);
      // 2.【传参】query
      // this.$router.push ({
      //   path:'/detail',
      //   query:{
      //   }
      // })
    },
  },
};
</script>

<style scoped>
.goods-item {
  padding-bottom: 40px;
  position: relative;
  width: 48%;
}
.goods-item img {
  width: 100%;
  border-radius: 5px;
}
.goods-info {
  font-size: 12px;
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  overflow: hidden;
  text-align: center;
}
.goods-info p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 3px;
}
.goods-info .price {
  color: var(--color-high-text);
  margin-right: 20px;
}
.goods-info .collect {
  position: relative;
}
.goods-info .collect::before {
  content: "";
  position: absolute;
  left: -15px;
  top: -1px;
  width: 14px;
  height: 14px;
  background: url("~assets/img/common/collect.svg") 0 0/14px 14px;
}
</style>