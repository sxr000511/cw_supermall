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
