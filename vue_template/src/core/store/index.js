


import {store as authStore} from '@/modules/auth/index'
import {store as moduleAStore} from '@/modules/moduleA/index'
import {store as moduleBStore} from '@/modules/moduleB/index'
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const rootStore = new Vuex.Store({
    modules:{
        authStore,
        moduleAStore,
        moduleBStore
    }
});
export default rootStore;