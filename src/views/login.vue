<template>
  <div class="login-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="login-title">后台管理系统</span>
      </div>
      <div class="login-form">
        <el-form :model="form" :rules="loginRules" ref="loginForm">
          <el-form-item prop="userName">
            <el-input
              type="text"
              v-model="form.userName"
              auto-complete="off"
              placeholder="请输入用户名"
            >
              <template slot="prepend"
                ><i style="font-size: 20px" class="el-icon-user"></i
              ></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="passWord">
            <el-input
              type="password"
              v-model="form.passWord"
              auto-complete="off"
              placeholder="请输入密码"
              show-password
            >
              <template slot="prepend"
                ><i style="font-size: 20px" class="el-icon-key"></i
              ></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              style="width: 100%"
              type="primary"
              @click="handleLogin"
              :loading="loading"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>
  
<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      form: {
        userName: "",
        passWord: "",
      },
      loginRules: {
        userName: [
          { required: true, message: "请输入账户名", trigger: "blur" },
        ],
        passWord: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm
        .validate()
        .then(() => {
          this.loading = true;
          axios
            .post(this.$global.loginUrl + "/login", {
              username: this.form.userName,
              password: this.form.passWord,
              flag: 1,
            })
            .then((res) => {
              this.loading = false;
              this.$message({
                message: "登录成功！",
                type: "success",
              });
              const userMsg = {
                userID: res.data[0].t_id,
                username: res.data[0].t_name,
                password: res.data[0].password,
                is_root: res.data[0].is_root,
              };
              this.$store.commit("saveUserMsg", userMsg);
              this.$router.replace({ path: "/backManage" });
            })
            .catch((err) => {
              this.loading = false;
              console.error("登录失败:", err);
              this.$message({
                message: "用户名或密码错误！",
                type: "error",
              });
            });
        })
        .catch((error) => {
          console.error("表单验证失败:", error);
          this.$message({
            message: "请检查输入！",
            type: "warning",
          });
        });
    },
  },
};
</script>
  
  <style scoped lang="less">
.login-page {
  background-image: url("@/assets/login2.jpg");
  background-size: cover;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .box-card {
    width: 25%;
    min-width: 20rem;
    margin-right: 10rem;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 1.25rem;
    .login-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: #1874cd;
    }
  }
}
</style>
  