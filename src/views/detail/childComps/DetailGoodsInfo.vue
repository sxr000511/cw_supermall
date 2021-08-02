<template>
  <!-- 父组件detailvue传来数据：detailInfo -->
  <!-- 先判断数据是否传入，传入开始显示dom -->
  <div v-if="Object.keys(detailInfo).length !== 0" class="goods-info">
    <!-- desc div -->
    <div class="info-desc clear-fix">
      <div class="start"></div>
      <div class="desc">{{ detailInfo.desc }}</div>
      <div class="end"></div>
    </div>
    <!-- 穿着效果 div -->
    <div class="info-key">{{ detailInfo.detailImage[0].key }}</div>
    <!-- 展示图片 div -->
    <!-- vfor循环生成img ，img在list里，监听每个img的加载事件调用imgload方法-->
    <div class="info-list">
      <img
        v-for="(item, index) in detailInfo.detailImage[0].list"
        :key="index"
        :src="item"
        @load="imgLoad"
        alt=""
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "DetailGoodsInfo",
  props: {
    detailInfo: {
      type: Object,
    },
  },
  data() {
    return {
      counter: 0,
      imagesLength: 0,
    };
  },
  methods: {
    imgLoad() {
      // 判断, 所有的图片都加载完了, 那么进行一次回调就可以了.，也可以不在这儿if判断，那样就会回调多次
      // 在性能和用户体验见折衷
      if (++this.counter === this.imagesLength) {
        this.$emit("imageLoad");
      }
    },
  },
  // 监听器watch，监听数据length变化赋值imageslength
  watch: {
    detailInfo() {
      // 获取图片的个数
      this.imagesLength = this.detailInfo.detailImage[0].list.length;
    },
  },
};
</script>

<style scoped>
.goods-info {
  padding: 20px 0;
  border-bottom: 5px solid #f2f5f8;
}

.info-desc {
  padding: 0 15px;
}

.info-desc .start,
.info-desc .end {
  width: 90px;
  height: 1px;
  background-color: #a3a3a5;
  position: relative;
}

.info-desc .start {
  float: left;
}

.info-desc .end {
  float: right;
}

.info-desc .start::before,
.info-desc .end::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: #333;
  bottom: 0;
}

.info-desc .end::after {
  right: 0;
}

.info-desc .desc {
  padding: 15px 0;
  font-size: 14px;
}

.info-key {
  margin: 10px 0 10px 15px;
  color: #333;
  font-size: 15px;
}

.info-list img {
  width: 100%;
}
</style>
