<template>
  <div class="tab-control">
    <div
      v-for="(item, index) in titles"
      :key="index"
      class="tab-control-item"
      :class="{ active: index === currentIndex }"
      @click="itemClick(index)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  name: "TabControl",
  props: {
    titles: {
      type: Array,
      // 默认数组对象必须写一个default[]
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      currentIndex: 0,
    };
  },
  methods: {
    // 监听div的click事件调用itemclick方法
    itemClick(index) {
      this.currentIndex = index;
      // 子给父传了tabclick事件
      this.$emit("tabClick", index);
    },
  },
};
</script>

<style>
.tab-control {
  display: flex;
  text-align: center;
  font-size: 15px;
  height: 40px;
  line-height: 40px;
  background-color: #fff;
}
.tab-control-item {
  flex: 1;
}

.tab-control-item span {
  padding: 5px;
}
.active {
  color: var(--color-high-text);
  border-bottom: 3px solid var(--color-tint);
}
.active span {
  border-bottom: 3px solid var(--color-tint);
}
</style>