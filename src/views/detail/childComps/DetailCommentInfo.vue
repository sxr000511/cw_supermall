<template>
  <div>
    <!-- 先判断有没有评论 v-if -->
    <div class="comment-info" v-if="Object.keys(commentInfo).length !== 0">
      <div class="info-header">
        <div class="header-title">用户评价</div>
        <div class="header-more">
          更多
          <i class="arrow-right" />
        </div>
      </div>
      <!-- 用户信息div -->
      <div class="info-user">
        <img :src="commentInfo.user.avatar" alt="" />
        <span>{{ commentInfo.user.uname }}</span>
      </div>
      <!-- 评价内容div -->
      <div class="info-detail">
        <p>{{ commentInfo.content }}</p>
        <div class="info-other">
          <!-- 串联过滤器 -->
          <!-- created：返回时间，时间戳 -->
          <span class="date">{{ commentInfo.created | showDate }}</span>
          <span>{{ commentInfo.style }}</span>
        </div>
        <!-- 评价图片div -->
        <div class="info-imgs">
          <!-- vfor遍历生成img，展示 -->
          <img
            :key="index"
            :src="item"
            alt=""
            v-for="(item, index) in commentInfo.images"
          />
        </div>
      </div>
    </div>
    <!-- velse：没有评论不展示 -->
    <div class="comment-info" style="color: red" v-else>暂无用户评论</div>
  </div>
</template>

<script>
// 引入时间戳格式化函数，正则
import { formatDate } from "@/common/utils";

export default {
  name: "DetailCommentInfo",
  props: {
    commentInfo: {
      type: Object,
    },
  },
  //   过滤器 时间戳-》时间格式字符串
  filters: {
    showDate: function (value) {
      // 1、将时间戳value(s)转换成Date对象(ms)  ->>乘一千
      let date = new Date(value * 1000);
      //   2、将Date进行格式化，转成对应的字符串，原生js没有，考下来放在utils.js
      return formatDate(date, "yyyy-MM-dd hh:mm");
    },
  },
};
</script>

<style scoped>
.comment-info {
  padding: 5px 12px;
  color: #333333;
  border-bottom: 5px solid #f2f5f8;
}
.info-header {
  line-height: 50px;
  height: 50px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.header-title {
  font-size: 15px;
  float: left;
}
.header-more {
  font-size: 13px;
  float: right;
  margin-right: 10px;
}
.info-user {
  padding: 10px 0 5px;
}
.info-user img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}
.info-user span {
  font-size: 15px;
  position: relative;
  top: -15px;
  margin-left: 10px;
}
.info-detail {
  padding: 0 5px 15px;
}
.info-detail p {
  font-size: 14px;
  line-height: 1.5;
  color: #777777;
}
.info-detail .info-other {
  font-size: 12px;
  margin-top: 10px;
  color: #999999;
}
.info-other .date {
  margin-right: 8px;
}
.info-imgs {
  margin-top: 10px;
}
.info-imgs img {
  width: 70px;
  height: 70px;
  margin-right: 5px;
}
</style>