<template>
  <div id="detail">
    <!-- navbar样式有改动，重新定义一个detailnavbar里放navbar更改样式 -->
    <detail-nav-bar />
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar.vue";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
  },
  data() {
    return {
      iid: null,
    };
  },
  //   生命周期函数created()
  //   从路径url传来的参数iid 保存到vue实例的data里
  created() {
    this.iid = this.$route.params.iid;
  },
};
</script>

<style>
</style>