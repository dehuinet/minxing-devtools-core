import Vue from 'vue'
import Router from 'vue-router'
import store from '../core/store'
import {route as authRouter} from '@/modules/auth'
import {route as dashBoardRouter} from '@/modules/dashBoard'
import { mapGetters } from 'vuex';


Vue.use(Router)

const router =  new Router({
  routes: [
    {
      path: '/',
      name: 'auth',
      redirect: '/auth'
    },
    authRouter,
    dashBoardRouter
  ]
})

const whiteList = ['login', 'register'];
router.beforeEach((to, from, next) => {
  if (whiteList.indexOf(to.name) > -1 || store.getters.getToken) {
    next(undefined);
  } else {
    next({
      path:'/auth'
    })
  }
})


export default router;