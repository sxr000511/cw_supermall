import { request } from "./request";
// {}对象来import，因为request不是exportdefault我们不能自己起别名

// 把首页所有的数据请求放到这个文件里统一管理
export function getHomeMultidata() {
  return request({
    url: "/home/multidata"
  });
}
