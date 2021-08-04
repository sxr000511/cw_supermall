import Vue from "vue";
import App from "./App.vue";
import router from "./router/index";
import store from "./store";

Vue.config.productionTip = false;

// 事件总线  $bus.$on  $bus.$emit
Vue.prototype.$bus = new Vue();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

// vue实例的生命周期
// Mount
// 载入后html已经渲染(ajax请求可以放在这个函数中)，把vue实例中的data里的message挂载到DOM节点中去
//
// 如果Vue实例对象中有template参数选项，则将其作为模板编译成render函数
// 如果没有template参数选项，则将外部的HTML作为模板编译（template），也就是说，template参数选项的优先级要比外部的HTML高
// Vue需要通过el去找对应的template，Vue实例通过el的参数，首先找自己有没有template，如果没有再去找外部的html，找到后将其编译成render函数。

// render函数是vue通过js渲染dom结构的函数createElement，约定可以简写为h

// 配置了el属性：
// new Vue({
//   el:"#app",
//   router
// });

// // 如果没有配置el属性，可以使用手动挂载$mount("#app")
// new Vue({
//   router
// }).$mount('#app');
