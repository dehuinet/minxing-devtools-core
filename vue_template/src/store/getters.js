
export const getUser = state => state.user;
export const getList = state => state.list;
export const getListData = state => getList(state).data;
export const getListQuery = state => getList(state).query;
export const getDetail = state => getList(state).detail;
export const getScrollTop = state => getList(state).scrollTop;