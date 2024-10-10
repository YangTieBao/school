<template>
  <div id="top">
    <img src="../../../public/phone/hngcxy.png" class="img" />
    <div class="main">
      <div class="search">
        <el-input v-model="searchQuery"></el-input>
        <i class="iconfont icon-sousuo"></i>
      </div>
      <i class="iconfont icon-xiaoxi-lingdang"></i>
      <i class="iconfont icon-lock"></i>
      <i class="iconfont icon-ai240"></i>
      <i class="iconfont icon-yonghuming"></i>
      <span>{{ name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      name: "张三",
    };
  },
};
</script>
<style lang="less" scoped>
@import url("../../../public/iconfont/iconfont.css");
#top {
  box-sizing: border-box;
  height: 8%;
  width: 100%;
  padding-right: 3rem;
  background-color: #fff;
  border-bottom: 0.1em solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .img {
    height:70%;
    margin-left: 2rem;
  }
  .main {
    display: flex;
    justify-content: right;
    align-items: center;
    .search {
      position: relative;
      display: flex;
      align-items: center;
      i {
        position: absolute;
        right: 0.4rem;
      }
    }
    i {
      font-size: 1.2rem;
      margin-left: 1rem;
    }
    span {
      font-size: 0.8rem;
      padding-top: 0.6rem;
      padding-left: 0.4rem;
    }
  }
}
</style>