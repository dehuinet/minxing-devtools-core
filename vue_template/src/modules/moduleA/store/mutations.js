import * as types from './types.js'


export default {
    [types.LIST_QUERY_INIT]: (state, { cate }) => {
        state.list = {
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
    [types.QUERY_LOAD_MORE]: (state) => {
        state.list.query = {
            ...state.list.query,
            page: state.list.query.page + 1
        }
    },
    [types.LIST_LOAD]: (state, { list }) => {
        const full = list.length < state.list.query.limit;
        state.list = {
            ...state.list,
            full,
            data: list
        }
    },
    [types.LIST_LOAD_MORE]: (state, { list }) => {
        const full = list.length < state.list.query.limit;
        state.list = {
            ...state.list,
            full,
            data: [...state.list.data, ...list]
        };
    },
    [types.DETAIL_INIT](state) {
        state.list = {
            ...state.list,
            detail: null
        }
    },
    [types.DETAIL_LOAD](state, { detail }) {
        state.list = {
            ...state.list,
            detail
        }
    },
    [types.LIST_SCROLL_TOP](state, { scrollTop }) {
        console.log('state ==>>',state)
        state.list = {
            ...state.list,
            scrollTop
        }
    }
}
