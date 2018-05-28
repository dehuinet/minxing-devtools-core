import { moduleAList } from '@/core/api';
import * as types from './types.js';
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
    moduleAList.getList(params)
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
    return moduleAList.getList(params)
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
    return moduleAList.getDetail({id}).then(detail => {
        commit(types.DETAIL_LOAD, { detail })
    })
}