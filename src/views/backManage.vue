<template>
  <div id="backManage">
    <Top />
    <div class="main">
      <div class="left">
        <el-row class="tac">
          <el-col>
            <el-menu
              :default-active="activeMenuIndex"
              class="el-menu-vertical-demo"
              background-color="#fff"
              @select="handleSelect"
            >
              <el-menu-item index="1">
                <i class="iconfont icon-jiaoshiguanli1"></i>
                <span slot="title">教师管理</span>
              </el-menu-item>
              <el-menu-item index="2">
                <i class="iconfont icon-xueshengguanli1"></i>
                <span slot="title">学生管理</span>
              </el-menu-item>
              <el-menu-item index="3">
                <i class="iconfont icon-banjiguanli2"></i>
                <span slot="title">班级管理</span>
              </el-menu-item>
              <el-menu-item index="8">
                <i class="iconfont icon-banjiguanli1"></i>
                <span slot="title">课程管理</span>
              </el-menu-item>
              <!-- <el-menu-item index="4">
                <i class="iconfont icon-paikeguanli1"></i>
                <span slot="title">排课管理</span>
              </el-menu-item> -->
              <!-- 二级菜单 -->
              <el-submenu index="4">
                <template slot="title">
                  <i class="iconfont icon-paikeguanli1"></i>
                  <span>排课管理</span>
                </template>
                <!-- 子菜单项 -->
                <el-menu-item index="4">
                  <span>排课设置</span>
                </el-menu-item>
                <el-menu-item index="9">
                  <span>查看排课</span>
                </el-menu-item>
              </el-submenu>
              <el-menu-item index="5">
                <i class="iconfont icon-zhouliguanli"></i>
                <span slot="title">周历管理</span>
              </el-menu-item>
              <el-menu-item index="6">
                <i class="iconfont icon-xiaoxiguanli1"></i>
                <span slot="title">消息管理</span>
              </el-menu-item>
              <el-menu-item index="7">
                <i class="iconfont icon-chengjiguanli1"></i>
                <span slot="title">成绩管理</span>
              </el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </div>
      <div class="right">
        <div class="right_top">
          <i class="iconfont icon-youshuangjiantou"></i>
        </div>
        <div class="right_bottom">
          <router-view :key="$route.fullPath"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Top from "../components/Top/Top.vue";

export default {
  data() {
    return {
      activeMenuIndex: "1", // 默认值是第一个菜单项
    };
  },
  mounted() {},
  components: {
    Top,
  },
  watch: {
    // 监听路由变化，确保当路由变化时更新菜单的选中状态
    "$route.query.index": {
      immediate: true, // 确保在组件初始化时也会触发
      handler(newIndex) {
        this.activeMenuIndex = newIndex || "1"; // 如果没有index，默认是第一个菜单项
      },
    },
  },
  methods: {
    handleSelect(index) {
      if (index == 9) {
        this.$router
          .push({
            name: "checkSchedule",
            query: {
              index: index,
            },
          })
          .catch((err) => {
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
        // 使用命名路由来进行路由跳转，确保路径正确
        this.$router
          .push({
            name: "all", // 根据实际的路由名称进行调整
            query: {
              index: index,
            },
          })
          .catch((err) => {
            if (
              err.name !== "NavigationDuplicated" &&
              !err.message.includes(
                "Avoided redundant navigation to current location"
              )
            ) {
              console.error("导航失败:", err);
            }
          });
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import url("../../public/iconfont/iconfont.css");
#backManage {
  height: 100%;
  width: 100%;
  min-width: 80rem;
  .main {
    height: 92%;
    width: 100%;
    box-sizing: border-box;
    background: #f5f5f5;
    padding-left: 0.5rem;
    display: flex;
    .left {
      height: 99%;
      width: 15rem;
      min-width: 15rem;
      background: #fff;
      margin-top: 0.5%;
      margin-right: 0.5%;
      .tac {
        width: 100%;
        margin-right: 0;
        font-weight: 700;
        .iconfont {
          margin-right: 0.2rem;
        }
      }
    }
    .right {
      height: 100%;
      width: 100%;
      .right_top {
        height: 6%;
        width: 100%;
        background: #fff;
        display: flex;
        justify-content: right;
        align-items: center;
        i {
          font-size: 1.4rem;
          font-weight: 700;
          margin-right: 0.5rem;
        }
      }
      .right_bottom {
        box-sizing: border-box;
        height: 93%;
        width: 99.5%;
        background: #fff;
        margin-left: 0.5%;
        margin-top: 1%;
        padding: 1.5%;
      }
    }
  }
}
</style>
  