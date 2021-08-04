import { ADD_TO_CART, ADD_TO_COUNTER } from "./constant";
// 常量是mutations的名字
// 通过actions来调用mutations，修改state里的数据
export default {
  // 加入购物车
  addCart({ state, commit }, payload) {
    return new Promise((resolve, reject) => {
      //1.查找之前数组中是否含有该商品
      let product = state.cartList.find(item => item.iid === payload.iid);

      //2. 判断product,这里涉及深拷贝与浅拷贝
      if (product) {
        commit(ADD_TO_COUNTER, product);
        resolve("成功添加购物车num+1");
      } else {
        // 添加num属性
        payload.num = 1;
        // 添加selecte属性
        payload.isSelected = false;
        commit(ADD_TO_CART, payload);
        resolve("成功添加购物车");
      }
    });
  }
};
