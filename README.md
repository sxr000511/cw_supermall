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
