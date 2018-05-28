import * as types from './types.js'


export default {
    [types.SONG_LIST_QUERY_INIT]: (state, { cate }) => {
        state.songList = {
            query: {
                page: 1,
                limit: 5,
                cate,
            },
            full: false,
            data: [],
            current: {}
        }
    },
    [types.SONG_QUERY_LOAD_MORE]: (state) => {
        state.songList.query = {
            ...state.songList.query,
            page: state.songList.query.page + 1
        }
    },
    [types.SONG_LIST_LOAD]: (state, { list }) => {
        const full = list.length < state.songList.query.limit;
        state.songList = {
            ...state.songList,
            full,
            data: list
        }
    },
    [types.SONG_LIST_LOAD_MORE]: (state, { list }) => {
        const full = list.length < state.songList.query.limit;
        state.songList = {
            ...state.songList,
            full,
            data: [...state.songList.data, ...list]
        };
    },
    [types.SONG_DETAIL_INIT](state) {
        state.songList = {
            ...state.songList,
            detail: null
        }
    },
    [types.SONG_DETAIL_LOAD](state, { detail }) {
        console.log('mutation detail ==>>',detail)
        state.songList = {
            ...state.songList,
            detail
        }
    },
    [types.SONG_LIST_SCROLL_TOP](state, { scrollTop }) {
        console.log('state ==>>',state)
        state.songList = {
            ...state.songList,
            scrollTop
        }
    }
}
