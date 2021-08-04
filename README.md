# cw_mall

## 【页面】Home

home 页面主要可以划分为 nav-bar，scroll 重构，swiper，tab-control，good-list 和 back-top 标签

### good-list

重点在如何从接口获得数据保存，如何把保存下来的数据展示两方面。

#### 【good-list】获得数据

数据结构为：每个 tab 对应一个对象，该对象内部是数组[page，datas]
axios 返回 promise 对象，在 home.vue 提取到数组里保存。

#### 【good-list】展示数据

由大组件封装小组件完成，大组件通过 home.vue 父传子得到对象，生成对象数目的小组件，小组件里设置具体的 css，html 结构

### scroll

重点在于事件的监听和父子组件间数据的传递
scroll 的状态直接影响到【数据的更新】 以及一些样式

```javascript
 <!-- probetype和pullupload都是父传子 ，传入参数决定是否监听滚动，是否上拉加载-->
    <!-- contentscroll是子传父，父组件contentscroll方法，父组件事件为sroll，监听子组件$emit的scroll事件  -->
    <!-- 在Vue中，我们不用获取dom节点，元素绑定ref之后，直接通过this.$refs即可调用，此处给scorll组件绑定ref为scroll，下面的方法用到了他 -->
    <!-- pullingup和scroll都是子组件传来的事件，父组件scroll监听，调用父组件的方法contentscroll 和loadmore -->
    <scroll
      class="content"
      ref="scroll"
      :probe-type="3"
      :pull-up-load="true"
      @scroll="contentScroll"
      @pullingUp="loadMore"
    >
    …………省略………
    </scroll>
```

### 其他知识

1. ref 和 \$refs
2. @click.native 监听组件 click 事件
3. 计算属性的更新

### 优化提升

#### 事件总线 和 防抖

##### 事件总线

每一个 goodlistitem 的图片加载完毕后，都让他向事件总线$bus.$emit 发送事件，与此同时，homevue 监听事件总线上的这个事件，$bus.$on ，每监听到一次，让 betterscroll 调用 refresh 方法，重新计算 scroll 高度
其中，\$bus 是挂载在 app.vue 上的 vue 实例，因为 vue 实例可以发射事件
这个功能也可以用 vuex 做
【还有一些小问题】

1. 注意在 mounted 监听事件，不要在 created，created 时 scroll 未挂载到 dom 上

##### 防抖

在事件总线监听基础上，需要防抖来降低性能浪费
因为如果不防抖，每张图片都要发射事件，资源浪费严重
debounce 函数如下

```javascript
 debounce(func, delay) {
   //func 什么函数 delay等多久
        let timer = null
        return function (...args) {
          //《《---...arg可以接收很多参数，不止一个
        //将之前timer清除重新计时
          if (timer) clearTimeout(timer)
          // 《---此处闭包，timer被if后面的timer引用，不会被销毁，会进入if判断
         //settimeout延时
          timer = setTimeout(() => {
            func.apply(this, args)
          }, delay)
        }
      },
```

home.vue 中监听

```javascript
mounted () {
    // 1.监听item中图片加载完成，
    //这里后面refresh不要加小括号，是传入函数！！不是函数返回值
     const refresh = debounce(this.$refs.scroll.refresh,50)
     //《《--debounce返回函数对象，refresh直接refresh（）可调用
      // 对监听的事件进行保存，方便离开home组件时取消此事件监听
       this.itemImgListener = () => { refresh() }
      // 此处是闭包，引用，上面的局部变量refresh（）不会被销毁（debounce里的timer也是闭包不会被销毁）
       this.$bus.$on('itemImageLoad', this.itemImgListener)
  },

```

#### tabcontrol 吸顶

在使用 bettercroll 吸顶效果受影响
解决方法：

1. 顶部防止额外的一个 tabcontrol，其显示状态初始为 false
2. 监听页面 swiper 图片加载，当图片加载结束后，获得原始 tabcontrol 的 top 值
3. 在 scroll 获得 height 的函数里，比较 tab 的原始 top 值和页面滚动值的大小关系
4. 当页面滚动到 tab 消失的位置时，控制额外的一个 tab 显示出来

由此做了一个假动画

#### 页面跳转保持

在 app.vue 中,

```
 <keep-alive><router-view /></keep-alive>
```

保持上次浏览位置

## 【页面】详情页

### detail 路由配置

views 增加一个 detail.vue 作为 home 的详情页
点击 homevue 里的 goodlistitem，跳转到对应的详情页
携带 ID 跳转，
路由跳转携带参数的方式：（见 vuerouter）

1. 动态路由  
   `动态绑定id，path：'/detail/:id'`
   //  不要在 path 里加一些空格！！！！会导致取不到 iid
2. query 方法

然后在 detal 里利用 `$route` 可获得当前路由的相关信息`params`,
`this.iid = this.$route.params.iid`

### navbar 导航

调用 common/navbar ，比较复杂在 detailnavbar 里做
在 slot=left 插入箭头，click 时间调用方法使路由返回
动态 v-for 遍历生成 4 个 slot = center，再设置相关样式，比如点击变红即可
（之前 home.vue 做过）

### detail 的重点：数据处理和保存

新建一个，在 detail.js,【根据 url 的 iid】请求数据 《《《---【数据很复杂】
我们需要抽离数据展示
[detai.js]:

```javascript
import { request } from "./request";
// {}对象来import，因为request不是exportdefault我们不能自己起别名

// 把首页所有的数据请求放到这个文件里统一管理
export function getDetail(iid) {
  return request({
    url: "/detail",
    params: {
      iid,
    },
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
```

detail.vue:保存数据，传给各个 childcomponent

```javascript
 //   生命周期函数created()
  created() {
    //   从路径url传来的参数iid 保存到vue实例的data里
    this.iid = this.$route.params.iid;
    // 从detail.js 【【获得数据】】
    getDetail(this.iid).then((res) => {
      // console.log(res);
      const data = res.result;
      // 1. 获取顶部轮播图数据  封装一个swipers展示这六张图片
      this.topImages = data.itemInfo.topImages;
      // 2.获取商品信息，goods封装类来自detail.js
      this.goods = new Goods(
        data.itemInfo,
        data.columns,
        data.shopInfo.services
      );
      // 3.创建店铺信息的对象
      this.shop = new Shop(data.shopInfo);
      // 4.保存商品的详情数据[没写类]
      this.detailInfo = data.detailInfo;
      // 5.获取参数的信息
      this.paramInfo = new GoodsParam(
        data.itemParams.info,
        data.itemParams.rule
      );
    });
  },
```

### 调用子组件子组件 detailbaseinfo.vue ，detailshopinfo.vue，DetailGoodsInfo.vue 等

简单页面构造，把从 detailvue 里保留的数据传到对应的子组件里，根据数据的含义设计样式即可

知识点：

1. vuefor 遍历数字
2. `<div v-if="Object.keys(goods).length !== 0" class="base-info"></div>`
   子组件渲染的时候可以先看一下父组件有没有传数据过来，有数据后再渲染
   【goods 是从 detailvue 获得的 props，如果不为空，渲染整个 detailinfo 大 div】
3. 过滤器 filter 过滤器串联

```javascript
 <!-- filters 过滤器 串联，sells是sellcountfilter的变量-->
<div class="sells-count">
     {{ shop.sells | sellCountFilter }}
</div>
  //  本地过滤器
filters: {
      sellCountFilter: function(value) {
        if (value < 10000) return value;
        return (value / 10000).toFixed(1) + "万";
      }
    }
```

```
本地的过滤器：filters: {}
创建 Vue 实例之前全局定义过滤器
        Vue.filter(‘name’, function () {})

        new Vue({
})
当全局过滤器和局部过滤器重名时，会采用局部过滤器。
 过滤器可以串联：
 1. {{ message | filterA | filterB }} 【 message-》fA-》fA output-》fB】
 2. {{ message | filterA('arg1', arg2) }}【fA（message，'agr1'，arg2）】 三参数的fA
```

4. 遍历生成表格 table -》 tr 行 row-》 td 数据 data，变量绑定 style
5. DetailGoodsInfo.vue 中
     图片全部加载完毕，子函数发送 imageload 事件到父组件， 《《《---省流
     父组件监听到事件调用方法，控制 scroll refresh 重新计算滚动高度，
     发送事件：【只发送一次  】通过 watch 监听属性变化

detail.vue 中
`<detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad" />`
detailgoodsinfo 中

watch 监听属性，【被监听的属性变化，调用函数】

```javascript
  <script>
  export default {
    name: "DetailGoodsInfo",
    props: {
      detailInfo: {
        type: Object
      }
    },
    data() {
      return {
        counter: 0,
        imagesLength: 0
      }
    },
    methods: {
      imgLoad() {
        // 判断, 所有的图片都加载完了, 那么进行一次回调就可以了.
        if (++this.counter === this.imagesLength) {
          this.$emit('imageLoad');
        }
      }
    },
    watch: {
      detailInfo() {
        // 获取图片的个数
        this.imagesLength = this.detailInfo.detailImage[0].list.length
      }
    }
  }
</script>
```

6. 引入 better scroll
   把想要滚动的页面放到 btscroll 标签内部
   注意：一定要给 scroll 设置高度才能滚动

### DetailCommentInfo.vue 【时间戳 -》格式字符串】

服务器 cteated 返回时间戳

处理方法

1. 时间格式化
2. 服务器返回时间戳->new date()->格式化

**用到了 filters 串联过滤器**
formatedate 来自 util.js，现成的【js 里没有原生方法】

```javascript
<span class="date">{{ commentInfo.created | showDate}}</span>

filters:{
    showDate(value) {
      // 1.将时间戳传换成Date对象
      const date = new Date(value)

      // 2.将date进行格式化
      return formatDate(date, 'yyyy-MM-dd')
    }
  }
```

### 推荐信息的展示

复用 homevue 里的 GoodsList，goodslistitem 展示一堆图片

1. detail.JS 里向路由请求信息
   getrecommend
2. 复用 goodslistitem 时，由于图片数据格式不一样，需要用计算属性绑定 ing'标签的 src 属性
   **注意或运算的懒运算，先后顺序很重要，一层一层拿**

```javascript
computed: {
    showImage () {
      return this.goodsItem.image || this.goodsItem.img || this.goodsItem.show.img
    }
  },
```

#### goodlistitem 向事件总线 emit 的问题

复用时，detailvue 的 goodslist 发送事件到事件总线让 homevue 刷新
不合理
解决方法

##### 1. 利用路由： if 判断 让每个 route 有自己的事件,不同组件互不干扰

goodlist 里

```javascript
methods: {
    imageLoad () {
      // 1. 利用路由的路径判断发送哪个事件
       if(this.$route.indexOf('/home')){
         this.$bus.$emit('homeImageLoad')
       }else if(this.$route.indexOf('/detail')){
         this.$bus.$emit('detailImageLoad')
       }
    },
```

##### 2.离开 homevue 组件时取消监听

1. 在 goodListItem 里面仍然只发送一个 imageLoad 图片加载事件

```javascript
methods: {
    imageLoad () {
      this.$bus.$emit("itemImageLoad")
    },
```

2. home 组件中`deactivated()`取消全局事件监听 :`this.$bus.$off`

**因为此时设置了 keep-alive，所以离开时调用的是 deactivated(),而不是 destroyed()**

home.vue

```javascript
deactivated () {
    // 保存离开时的位置信息到this.saveY
    this.saveY = this.$refs.scroll.getScrollY()
    // console.log(this.saveY);
    // 2.取消全局事件监听（主页图片加载的监听）因为此时设置了keep-alive，所以离开时调用的是deactivated()
    this.$bus.$off('itemImageLoad',this.itemImgListener)
  },
```

**注意**
`this.$bus.$off`如果只传一个参数，意味着所有组件中这个事件监听都将被取消，
利用第二个参数：函数，指定取消的位置，这个函数就是监听这个事件的函数，
mounted 中

```javascript
mounted () {
    // 可利用混入，减少重复代码
    // 1.监听item中图片加载完成，刷新防抖函数放到了utils.js中，工具库
     const refresh = debounce(this.$refs.scroll.refresh,50)
      // 对监听的事件进行保存，方便离开home组件时取消此事件监听
       this.itemImgListener = () => { refresh() }

       this.$bus.$on('itemImageLoad', this.itemImgListener)
  },

```

其中 `itemImgListener`是在 data 里定义的 null，用来保存事件监听回调函数

**另外，没有对 Detail 组件 keep-alive，所以在离开组件时取消图片加载事件的监听，要用 destroyed() 生命周期函数取消事件**

```javascript
destroyed () {
    // detail.vue 离开组件时取消图片加载监听事件
    this.$bus.$off('itemImageLoad', this.itemImgListener)
  },
```

### mixin 【vue 高级】

由上可见，在总线监听的时候有很多重复的代码，可以使用 mixin
会**合并**
使用方法如下

1. 在 common 文件夹下创建 mixin.js
2. 在需要的组件中导入

mixin.js 中：
data 可以不在 mixin 中定义，记得引入 debounce 防抖函数

```javascript
// mixin 混入，此mounted 函数将与组件内的 mounted 函数合并，不冲突
// 混入时写的哪个函数，导入后就能实现相应函数的功能
import { debounce } from "./utils";
export const imgListenerMixin = {
  data() {
    return {
      // 监听图片
      imgListener: null,
    };
  },
  mounted() {
    // 给防抖函数赋值一个新的函数
    const refresh = debounce(this.$refs.scroll.refresh, 50); // 接收发射的事件总线,并用监听图片变量保存
    this.imgListener = () => {
      refresh();
    };
    this.$bus.$on("imgLoad", this.imgListener);
  },
};
```

导入到具体组件 **mixins: [itemListenerMixin]**

```javascript
import {itemListenerMixin} from 'common/mixin.js'
// 混入
  mixins: [itemListenerMixin],
```

### 详情页中 navbar 与内容的联动【 点击滚动+滚动变红 】

#### 点击 navbar 跳转至相应位置

获取到对应组件元素的 offsetTop
再监听点击事件，进行跳转
关键：
**【【获取到正确的 offsetTop】】《《--即如何获得组件正确的 offsettop**

1. created: 不能获取到元素
2. mounted ：【可能子组件没有加载完成，因为子组件在有数据时才开始渲染（见 vue 组件）】组件中的数据还没有获取到
3. 获取到数据的回调中也不行，能保证组件中有数据，但是若 DOM 还没渲染完，拿不到元素的 offsetTop（需要渲染完成，再更新 dom）

##### 方法一： 放在 updated() {} 里 《《--不好 每次更新都会 push

一共四个 offsettop 依次推入数组
**refs.~~ 用于 利用 ref 获得 vue 实例（vue 子组件设置 ref 属性）**
**el 用于获得 dom 元素**

```javascript
this.themeTopYs.push(this.$refs.params.$el.offsetTop);
```

```javascript
updated() {
//每次更新都会push，每次更新前先让他为空[]
  this.themeTopYs = []
  this.themeTopYs.push(0);
  this.themeTopYs.push(this.$refs.params.$el.offsetTop)
  this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
  this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
}
```

##### 方法二: 利用\$nextTick，放在渲染完数据之后，回调一次 《《--不好 图片还没有加载完

这个方法，\$nexttick 回调时，根据最新的数据，DOM 已经被渲染出来了
但是图片还没有加载完
offset 值不对一般都是因为图片加载的原因

```javascript
this.$nextTick(() => {
  this.themeTopYs = [];

  this.themeTopYs.push(0);
  this.themeTopYs.push(this.$refs.params.$el.offsetTop);
  this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
  this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
});
```

##### 方法三 should: 放到 scroll 图片加载完毕后的监听方法里

**【【加防抖】】**

```javascript
methods: {
    imgLoad () {
      this.$refs.scroll.refresh()
      this.getTopYs()
    },

```

```javascript
created () {
// 4. 为topYs设置防抖
    this.getTopYs = debounce(() => {
      this.topYs = []
      this.topYs.push(0)
      this.topYs.push(this.$refs.params.$el.offsetTop)
      this.topYs.push(this.$refs.comment.$el.offsetTop)
      this.topYs.push(this.$refs.recommend.$el.offsetTop)
      this.topYs.push(Number.MAX_VALUE) // 在数组末尾增加一个无限大的值，为了之后对数组做遍历
      <!-- console.log(this.topYs) -->
    },100)

```

```javascript
// 点击跳转
clickTitle (index) {
      // console.log(index);
      this.$refs.scroll.scrollTo(0,-this.topYs[index],1000)
    },

```

#### 滚动变红-》》滚动内容区域与标题联动

**【重点：判断条件】**
在获取四个 offsetTop 之后，push 进一个最大值，这样就不用分开写条件了，不会溢出

```javascript
for(let i=0;i<length-1;i++){
          if(this.currentIndex !== i && (i<length-1 && positionY >= this.topYs[i] && positionY < this.topYs[i+1])){
            this.currentIndex = i
          console.log(i); // 因为此时打印非常频繁，所以将当前index保存为一个变量，在两个不等的情况下才打印，就不会很频繁
          console.log(this.topYs[i]); // 此处的值是正值
          this.$refs.nav.currentIndex = this.currentIndex
        }

```

### 详情页的回到顶部

和 homevue 相同
methods 里不能抽混入 生命周期函数可以

为了复用 home 页的回到顶部组件，进行抽取
home.vue 和 detail.vue 回到顶部: mixin

### 添加购物车点击事件 **VUEX**

**VUEX** <<<----页面跳转保存数据

1. 监听点击，获取商品信息：iid/price/image/desc/title...etc
2. 将商品添加到 Vuex 中
   **【要先判断添加的东西是不是已经在 carlist 里存在了，如果存在了就数量加 1】**
   这个功能需要【**mutations 重构**】
3. detailvue 里，actions 调用 dispatch

```javascript
addToCart() {
      // console.log("addcart");
      // 1.获取购物车需要展示的信息，因为有多个信息，所以可以放在一个对象里
      const product = {};
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.newPrice;
      // id一定要传，因为id是商品的唯一标识，是将id传给服务器获取到对应的商品
      product.iid = this.iid;
      product.realPrice = this.goods.realPrice;

      // 2.将商品添加到购物车里
      // this.$store.cartList.push(product)  //不要这么做，对store中状态的修改要通过mutation
      // 直接通过mutation
      // console.log(product);
      // this.$store.commit("addCart", product);
      // mutations重构

      // 通过action【 通过 .dispatch 】
      this.$store.dispatch("addCart", product);
      // action返回promise  可以返回信息
      // this.$store.dispatch('addCart', product).then(res => {
      //   console.log(res)
      // })
    },
```

#### VUEX 重构

mutations 唯一的目的是修改 state 中的状态
mutations 中的每个方法尽可能完成的事件比较单一一点

1. 将 mutations 中的代码抽取 action 中（定义两个 mutations）
2. 将 mutatons/actions/常量 etc 单独抽取到文件中

store->

1. constant.js
   把变量替换成常量
   常量是 mutations 的名字

```
export const ADD_TO_CART = 'add_to_cart';
export const ADD_TO_COUNTER = 'add_to_counter';
```

2. actions.js
   通过 actions 调用 mutations，来修改 state
   加入购物车时调用

```
import {
    ADD_TO_CART,
    ADD_TO_COUNTER
} from './constant';

export default {
    // 加入购物车
    addCart({state, commit}, payload){
        return new Promise((resolve, reject)=>{
            //1.查找之前数组中是否含有该商品
            let product = state.cartList.find((item)=> item.iid === payload.iid);

            //2. 判断product,这里涉及深拷贝与浅拷贝
            if(product){
                commit(ADD_TO_COUNTER, product);
                resolve('成功添加购物车num+1');
            }else {
                // 添加num属性
                payload.num = 1;
                // 添加selecte属性
                payload.isSelected = false;
                commit(ADD_TO_CART, payload);
                resolve("成功添加购物车");
            }
        })
    }
}
```

3. getters.js 用作计算属性的功能
   购物车列表 和购物车长度

```
export default {
    cartList(state){
        return state.cartList;
    },
    cartListLength(state){
        return state.cartList.length;
    }
}
```

4. mutations.js
   被 actions 调用， 要通过 mutations 修改 state！！

```
import {
    ADD_TO_CART,
    ADD_TO_COUNTER
} from './constant';

export default {
    [ADD_TO_CART](state,payload){
        state.cartList.push(payload);
    },
    [ADD_TO_COUNTER](state, payload){
        payload.num ++ ;
    }
}
```

5. index.js

```
export default new Vuex.Store({
    state,
    mutations,
    actions,
    getters
})
```

## 【页面】 购物车组件 cart

### 在 navbar 上显示商品数量

可将实时展示的购物车的数量用 vuex 的 getters 做封装，再引入 vuex 的 mapGetters 做**解构引入**

```
computed: {
    //   1.普通写法
    // cartLength () {
    // //   return this.$store.state.cartLish.length  将方法封装到getters之前的写法
    //   return this.$store.getters.cartLength   封装到getters之后的写法
    // }
    // 2.利用mapGetters解构 ， 还可用 mapState , mapActions
    ...mapGetters(['cartLength'])
  }

```

### 购物车商品的展示

#### 刷新界面

由于新加入的商品可能未被 better-scroll 所获取，所以导致不能滚动，可以在进入购物车时就做一次刷新 **activated()**

```
activated () {
    // console.log('0000');
    this.$refs.scroll.refresh()
  }
```

#### 商品的选中状态

记录商品的选中状态，不能用属性记录，要在商品对应的对象模型里记录，之后修改也是修改对象模型里的某个属性来进行修改
对象模型即`cartList[商品1，商品2]`中的商品模型，
为商品模型设置一个 selected 属性，记录它的选中与否
【在 actionsjs 里】【调用 mutations】

```javascript
export default {
  // 加入购物车
  // payload：由detailvue传来的product对象，包含image，title，iid，etc
  addCart({ state, commit }, payload) {
    return new Promise((resolve, reject) => {
      //1.查找之前数组中是否含有该商品
      let product = state.cartList.find((item) => item.iid === payload.iid);

      //2. 判断product,这里涉及深拷贝与浅拷贝
      if (product) {
        commit(ADD_TO_COUNTER, product);
        resolve("成功添加购物车num+1");
      } else {
        // 添加num属性
        payload.num = 1;
        // 添加selected属性
        payload.isSelected = false;
        commit(ADD_TO_CART, payload);
        resolve("成功添加购物车");
      }
    });
  },
};
```

### cart 底部信息计算

通过计算属性处理来自 vuex 的数据，把计算属性{{}}绑定在 dom 里

#### 计算总价

array 的**filter + reduce**
通过 filter 选出被选中的商品，再通过 reduce 计算总额

```javascript
computed: {
    ...mapGetters(['cartList']),
    totalPrice () {
    //   return '￥' + this.$store.state.cartList.filter(item => {
      return '￥' + this.cartList.filter(item => {  // mapGetters结构之后这样写
          return item.checked}).reduce((preValue,item) => {
              return preValue + item.price * item.count
          },0).toFixed(2) // toFixed(2) 计算结果保留2位小数
    },

```

#### 设置全选按钮

array.find
初始状态：购物车没有商品时默认不选中
只要有一个未被选中，则不选中全选按钮，用 find 性能最高
computed:计算属性下

```javascript
isSelectAll () {
    // 1. filter会将数组全部遍历完
    // if(this.cartList.length === 0) return false
    //   return !(this.cartList.filter(item => !item.checked).length) // 对未被选中的商品长度进行取反，0取反为true
    // 2.简单遍历，也会全部遍历完
    // for(let item of this.cartList){
    //     if(!item.checked){ // 没有选中的情况为真
    //             return false
    //         }
    //     }
    //         return true
    // 3. find 只找到一个就不找了，性能会高一点
      if(this.cartList.length === 0) return false  // 购物车中没有商品时，默认不选中
      return !(this.cartList.find(item => !item.checked)) // (括号里面有值的情况下再取反，结果就为false)
    }
```
