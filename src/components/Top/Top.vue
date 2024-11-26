<template>
  <div id="top">
    <!-- <img src="../../../public/phone/hngcxy.png" class="img" /> -->
    <div style="display: flex; align-items: center">
      <img src="@/assets/top.jpg" class="img" />
      <div class="special-font-text">智能科学与工程学院</div>
    </div>
    <div class="main">
      <!-- <div class="search">
        <el-input v-model="searchValue"></el-input>
        <i class="iconfont icon-sousuo"></i>
      </div> -->
      <!-- <i class="iconfont icon-xiaoxi-lingdang"></i> -->
      <i
        v-show="isshow"
        class="iconfont icon-fanhui1"
        style="font-weight: 700"
        @click="fanhui"
      ></i>
      <i
        class="iconfont icon-lock"
        @click="revisePassword"
        style="font-weight: 700"
      ></i>
      <i
        class="iconfont icon-ai240"
        style="font-size: 1.5rem"
        @click="exit"
      ></i>
      <i class="iconfont icon-yonghuming"></i>
      <span style="font-weight: 700">{{ name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      searchValue: "",
      name: "",
      isshow: false,
    };
  },
  mounted() {
    this.name = this.$store.state.username;
    setTimeout(() => {
      if (this.$route.name == "revisePassword") {
        this.isshow = true;
      }
    }, 200);
  },
  methods: {
    revisePassword() {
      this.isshow = true;
      // 检查当前路径是否已经是目标路由
      if (this.$route.name !== "revisePassword") {
        this.$router
          .push({ name: "revisePassword" }) // 使用命名路由进行导航
          .catch((err) => {
            // 处理重复导航错误或其他导航问题
            if (
              err.name !== "NavigationDuplicated" &&
              !err.message.includes(
                "Avoided redundant navigation to current location"
              )
            ) {
              console.error("导航失败:", err);
            }
          });
      } else {
        this.isshow = true; // 如果已经在当前路由，直接显示返回按钮
      }
    },
    fanhui() {
      console.log(this.isshow);
      this.isshow = false;
      this.$router.push({ path: "/backManage" });
    },
    exit() {
      // 弹出确认框
      this.$confirm("确定要退出登录吗?", "确认退出", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 用户确认退出登录
          this.$store.commit("logout"); // 清除登录状态，如果你在 Vuex 中有定义登出的方法
          this.$router.replace({ path: "/login" }); // 跳转到登录页面
          this.$message({
            message: "已成功退出登录！",
            type: "success",
          });
        })
        .catch(() => {
          // 用户点击取消时的处理
          this.$message({
            message: "退出登录操作已取消！",
            type: "info",
          });
        });
    },
  },
};
</script>
<style lang="less" scoped>
@import url("../../../public/iconfont/iconfont.css");
@font-face {
  font-family: "MySpecialFont";
  src: url("@/fonts/home2.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}
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
    width: 2.5rem;
    height: 2.5rem;
    height: auto;
    margin-left: 0.6rem;
    margin-bottom: 0; /* 图片下方的间距，保持不变（0px无需转换） */
  }
  .special-font-text {
    font-family: "MySpecialFont", sans-serif;
    color: #1874cd;
    font-size: 1.3rem;
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