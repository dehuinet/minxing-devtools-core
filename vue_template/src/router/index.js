import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import List from '@/components/List';
import Detail from '@/components/Detail';
import Query from '@/components/Query';
import store from '@/store';
Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: 'login',
    }, {
      path: '/login',
      name: 'Login',
      component: Login,
    }, {
      path: '/query',
      name: 'Query',
      component: Query,
    }, {
      path: '/list',
      name: 'List',
      component: List,
      beforeEnter: (to, from, next) => {
        if (store.state.list.query.cate) {
          next()
        }else{
          router.push('/query');
        }
      }
    }, {
      path: '/list/:id',
      name: 'Detail',
      component: Detail,
    }
  ],
});

router.beforeEach((to, from, next) => {
  if (to.name === 'Login' || store.state.user.token) {
    next();
  } else {
    router.push('/login');
  }
})
export default router