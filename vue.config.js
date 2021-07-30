module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // 取别名
        assets: "@/assets",
        common: "@/common",
        components: "@/components",
        network: "@/network",
        views: "@/views",
      },
    },
  },
};
