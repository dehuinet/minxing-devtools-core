
export const getSongList = state => state.songList;
export const getSongListData = state => getSongList(state).data;
export const getSongListQuery = state => getSongList(state).query;
export const getSongDetail = state => getSongList(state).detail;
export const getSongScrollTop = state => getSongList(state).scrollTop;
export const getSongListFull = state => getSongList(state).full