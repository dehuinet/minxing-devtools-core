// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './rootRouter'
import store from '@/core/store'
import  { ToastPlugin, LoadingPlugin } from 'vux'
import './share/assets/style/mx_ui.css';
Vue.use(ToastPlugin)
Vue.use(LoadingPlugin)

// import './core/api/config'
require('./core/api/config')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
