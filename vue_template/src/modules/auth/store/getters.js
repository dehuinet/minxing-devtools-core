export const getUser = state => state.user;
export const getToken = state => getUser(state).token;