import { moduleBList } from '@/core/api';
import * as types from './types.js';
//  根据栏目 初始化LIST
export const getSongListFn = ({
    commit,
    state,
    getters
}, payload) => {
    commit(types.SONG_LIST_QUERY_INIT, payload);
    var params = {
        ...getters.getSongListQuery,
    }
    moduleBList.getSongList(params)
        .then(list => {
            commit(types.SONG_LIST_LOAD, { list });
        })
}

// 加载更多 PAGE++
export const getSongMoreList = ({
    commit,
    state,
    getters
}) => {
    commit(types.SONG_QUERY_LOAD_MORE);
    var params = {
        ...getters.getSongListQuery,
    }
    return moduleBList.getSongList(params)
        .then(list => {
            commit(types.SONG_LIST_LOAD_MORE, { list })
        })
}


export const getSongDetailFn = ({
    commit,
    state,
    getters
}, { id }) => {
    commit(types.SONG_DETAIL_INIT);
    return moduleBList.getSongDetail({id}).then(detail => {
        commit(types.SONG_DETAIL_LOAD, { detail })
    })
}