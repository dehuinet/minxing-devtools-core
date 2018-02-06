const state = {
    user: {
        id: "",
        name: "",
        token: ""
    },

    list: {
        query: {
            page: 1,
            limit: 5,
            cate: null,
        },
        full: false,
        data: [],
        detail:{},
        scrollTop: null
    },
}

// init state
if (window.localStorage['VUE_DEMO_USER']) {
    state.user = JSON.parse(window.localStorage['VUE_DEMO_USER']);
}

export default state;
