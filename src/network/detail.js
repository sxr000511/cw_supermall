import { request } from "./request";
// {}对象来import，因为request不是exportdefault我们不能自己起别名

// 把首页所有的数据请求放到这个文件里统一管理
export function getDetail(iid) {
  return request({
    url: "/detail",
    params: {
      iid
    }
  });
}
// 推荐信息在另一个接口下
export function getRecommend() {
  return request({
    url: "/recommend"
  });
}

// 将复杂数据封装成数据类传给detail.vue
export class Goods {
  constructor(itemInfo, columns, services) {
    this.title = itemInfo.title;
    this.desc = itemInfo.desc;
    this.newPrice = itemInfo.price;
    this.oldPrice = itemInfo.oldPrice;
    this.discount = itemInfo.discountDesc;
    this.columns = columns;
    this.services = services;
    this.realPrice = itemInfo.lowNowPrice;
  }
}

export class Shop {
  constructor(shopInfo) {
    this.logo = shopInfo.shopLogo;
    this.name = shopInfo.name;
    this.fans = shopInfo.cFans;
    this.sells = shopInfo.cSells;
    this.score = shopInfo.score;
    this.goodsCount = shopInfo.cGoods;
  }
}

export class GoodsParam {
  constructor(info, rule) {
    // 注: images可能没有值(某些商品有值, 某些没有值)
    this.image = info.images ? info.images[0] : "";
    this.infos = info.set;
    this.sizes = rule.tables;
  }
}
