import { login } from '../http/login';
import { getList, getDetail } from '../http/list';
import * as types from './types.js';
const ls = window.localStorage;
export const loginFn = ({
    commit,
    state
}, payload) => {
    return login(payload)
        .then(user => {
            ls['VUE_DEMO_USER'] = JSON.stringify(user);
            commit(types.AUTH_LOGIN, user);
        });
}

export const logoutFn = ({
    commit,
}) => {
    delete ls['VUE_DEMO_USER'];
    commit(types.AUTH_LOGOUT);
}

//  根据栏目 初始化LIST
export const getListFn = ({
    commit,
    state,
    getters
}, payload) => {
    commit(types.LIST_QUERY_INIT, payload);
    var params = {
        ...getters.getListQuery,
        id: getters.getUser.id
    }
    getList(params)
        .then(list => {
            commit(types.LIST_LOAD, { list });
        })
}

// 加载更多 PAGE++
export const getMoreList = ({
    commit,
    state,
    getters
}) => {
    commit(types.QUERY_LOAD_MORE);
    var params = {
        ...getters.getListQuery,
        id: getters.getUser.id,
    }
    return getList(params)
        .then(list => {
            commit(types.LIST_LOAD_MORE, { list })
        })
}


export const getDetailFn = ({
    commit,
    state,
    getters
}, { id }) => {
    commit(types.DETAIL_INIT);
    return getDetail({id}).then(detail => {
        commit(types.DETAIL_LOAD, { detail })
    })
}