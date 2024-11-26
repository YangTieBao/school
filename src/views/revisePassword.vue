<template>
  <div class="container">
    <Top />
    <div class="revise">
      <el-card class="box-card">
        <el-form
          :model="form"
          ref="passwordForm"
          :rules="rules"
          label-width="100px"
          class="form-container"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :disabled="true"
            ></el-input>
          </el-form-item>

          <!-- 旧密码 -->
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              v-model="form.oldPassword"
              type="password"
              placeholder="请输入旧密码"
              show-password
            ></el-input>
          </el-form-item>

          <!-- 新密码 -->
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            ></el-input>
          </el-form-item>

          <!-- 确认新密码 -->
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              show-password
            ></el-input>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" @click="submitForm">提交修改</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
        <span style="color: red; text-indent: 2rem">注意：密码至少6位数！</span>
      </el-card>
    </div>
  </div>
</template>
  
<script>
import Top from "@/components/Top/Top.vue";
import axios from "axios";

export default {
  data() {
    return {
      form: {
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        oldPassword: [
          { required: true, message: "请输入旧密码", trigger: "blur" },
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请确认新密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.newPassword) {
                callback(new Error("新密码和确认密码不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  components: {
    Top,
  },
  mounted() {
    this.form.username = this.$store.state.userID;
  },
  methods: {
    submitForm() {
      this.$refs.passwordForm.validate((valid) => {
        if (!valid) {
          this.$message({
            message: "请输入6位数及以上的密码！",
            type: "error",
          });
          return false;
        }

        // 弹出确认框
        this.$confirm("确定要修改密码吗?", "确认操作", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            // 用户确认操作，执行修改密码
            axios
              .post(this.$global.loginUrl + "/revisePassword", {
                username: this.form.username,
                oldPassword: this.form.oldPassword,
                newPassword: this.form.newPassword,
              })
              .then(() => {
                this.$message({
                  message: "修改密码成功！",
                  type: "success",
                });
                // 清除登录状态
                this.$store.commit("logout"); // 如果你在 Vuex 中有定义登出的方法
                this.resetForm();
                this.$router.replace({ path: "/login" });
              })
              .catch(() => {
                this.$message({
                  message: "修改密码失败，请检查输入！",
                  type: "error",
                });
              });
          })
          .catch(() => {
            // 用户点击取消按钮时的处理
            this.$message({
              message: "操作已取消！",
              type: "info",
            });
          });
      });
    },
    resetForm() {
      this.$refs.passwordForm.resetFields();
      this.form.username = this.$store.state.userID;
    },
  },
};
</script>
  
<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  .revise {
    width: 100%;
    height: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
    .box-card {
      background: #dbdbdb;
      width: 50%;
      min-width: 25rem;
      padding: 1.25rem;
      .form-container {
        margin-top: 1.25rem;
        .el-form-item {
          width: 50%;
          .el-input {
            min-width: 10rem;
          }
        }
      }
    }
  }
}
</style>
  