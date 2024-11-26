import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userID: localStorage.getItem('userID') || '', // 从 localStorage 中恢复
    username: localStorage.getItem('username') || '', // 从 localStorage 中恢复
    password: localStorage.getItem('password') || '',  // 从 localStorage 中恢复
    is_root: localStorage.getItem('is_root') || ''  // 从 localStorage 中恢复
  },
  mutations: {
    saveUserMsg(state, userMsg) {
      state.userID = userMsg.userID;
      state.username = userMsg.username; // 正确存储用户名
      state.password = userMsg.password; // 正确存储密码
      state.is_root = userMsg.is_root; // 正确存储权限
      localStorage.setItem('userID', userMsg.userID);
      localStorage.setItem('username', userMsg.username); // 修正此处
      localStorage.setItem('password', userMsg.password); // 修正此处
      localStorage.setItem('is_root', userMsg.is_root); // 修正此处
    },
    // 添加登出 mutation，用于清除用户信息
    logout(state) {
      state.userID = '';
      state.username = '';
      state.password = '';
      state.is_root = '';
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      localStorage.removeItem('is_root');
    },
  },
  actions: {
  },
  modules: {
  }
})
