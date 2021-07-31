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

待补充

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
