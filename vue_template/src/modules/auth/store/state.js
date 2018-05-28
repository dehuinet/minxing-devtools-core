const state = {
    user: {
        id: "",
        name: "",
        token: ""
    }
}
if (window.localStorage['VUE_DEMO_USER']) {
    state.user = JSON.parse(window.localStorage['VUE_DEMO_USER']);
}
export default state;
