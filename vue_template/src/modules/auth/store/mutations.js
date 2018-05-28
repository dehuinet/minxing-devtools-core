import {LOGIN, LOGOUT } from './types';

export default {
    [LOGIN](state, payload) {
        state.user = payload;
    },
    [LOGOUT](state) {
        state.user = {id:'', name:'', token:''};
    }
}