// 防抖函数,解决重复频繁调用问题
export function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// /////////////////////////////////////////////////////////
// 评论信息模块
// 时间戳转换格式化字符串

function padLeftZero(str) {
  return ("00" + str).substr(str.length);
}

// 时间格式化
export function formatDate(date, fmt) {
  // m+：首先匹配m，+：一个或多个，后面可以接几个m
  //  m*：0个或多个
  // m？：0个或1个
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      //   简易转成字符串，substr转换字符串，$1:是regexp属性，指的是于正则匹配的第一个string
      // 结果：yyyy变2019
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  let o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds()
  };

  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + "";
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str)
      );
    }
  }

  return fmt;
}
