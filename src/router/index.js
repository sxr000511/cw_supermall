import Vue from "vue";
import VueRouter from "vue-router";
const Home = () => import("../views/home/Home");
const Category = () => import("../views/category/Category");
const Cart = () => import("../views/cart/Cart");
const Profile = () => import("../views/profile/Profile");
const Detail = () => import("../views/detail/Detail");

Vue.use(VueRouter);

const routes = [
  {
    // 默认跳转到/home
    path: "",
    redirect: "/home"
  },
  {
    path: "/home",
    component: Home
  },
  {
    path: "/category",
    component: Category
  },
  {
    path: "/cart",
    component: Cart
  },
  {
    path: "/profile",
    component: Profile
  },
  {
    // 动态路由 iid 商品id，要和detaivue里保持一致
    // 不要在path里加一些空格！！！！
    path: "/detail/:iid",
    component: Detail
  }
];

const router = new VueRouter({
  routes,
  mode: "history"
});

export default router;
