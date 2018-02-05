<template>
    <div id="app">
        <drawer width="200px;" :show.sync="drawerVisibility" :show-mode="showModeValue" :placement="showPlacementValue" :drawer-style="{'background-color':'#35495e', width: '200px'}">
            <div slot="drawer">
                <group title="敏行vue模版演示" style="margin-top:20px;">
                    <cell title="菜单" value="演示" @click.native="drawerVisibility = false"></cell>
                </group>
                <group title="showMode">
                    <radio v-model="showMode" :options="['push', 'overlay']" @on-change="onShowModeChange"></radio>
                </group>
                <group title="placement">
                    <radio v-model="showPlacement" :options="['left', 'right']" @on-change="onPlacementChange"></radio>
                </group>
                <group title="退出登录">
                    <cell title="退出登录" @click.native="logOut"></cell>
                </group>
            </div>
            <view-box ref="viewBox" body-padding-top="46px" body-padding-bottom="55px">
                <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" :left-options="leftOptions" :right-options="rightOptions" :title="title" @on-click-more="onShowMenuClick">
                </x-header>
                <router-view></router-view>
            </view-box>
        </drawer>
    </div>
</template>
<script>
import { Radio, Drawer, Group, Cell, ViewBox, XHeader, Toast } from 'vux';
import { LIST_SCROLL_TOP, AUTH_LOGOUT } from "./store/types.js"

export default {
    components: {
        Radio,
        Drawer,
        Group,
        Cell,
        ViewBox,
        XHeader,
        Toast
    },
    data() {
        return {
            showMenu: false,
            drawerVisibility: false,
            showMode: 'overlay',
            showModeValue: 'overlay',
            showPlacement: 'left',
            showPlacementValue: 'left',
        };
    },
    methods: {
        onShowModeChange(val) {
            this.drawerVisibility = false;
            setTimeout(() => {
                this.showModeValue = val;
            }, 400);
        },
        onPlacementChange(val) {
            this.drawerVisibility = false;
            setTimeout(() => {
                this.showPlacementValue = val;
            }, 400);
        },
        onShowMenuClick() {
            this.drawerVisibility = true;
        },
        handler() {
            const scrollTop = this.$refs.viewBox.getScrollTop();
            this.$store.commit(LIST_SCROLL_TOP, {
                scrollTop
            })
        },
        scrollTopInit() {
            this.$store.commit(LIST_SCROLL_TOP, {
                scrollTop: 0
            })
        },
        logOut() {
            this.$store.dispatch('logoutFn');
            this.$router.push('/login');
            this.drawerVisibility = false;
        }
    },
    computed: {
        leftOptions() {
            var vm = this;
            let name = this.$route.name
            switch (name) {
                case 'Login':
                    vm.title = '登录';
                    return { showBack: false };
                    break;
                case 'Query':
                    vm.title = '查询';
                    return { showBack: false };
                    break;
                case 'List':
                    vm.title = '列表';
                    return { showBack: true };
                    break;
                case 'List_Detail':
                    vm.title = '详情';
                    return { showBack: true };
                    break;
                default:
                    vm.title = '';
                    return { showBack: true };
            }
        },
        rightOptions() {
            var vm = this;
            let name = this.$route.name
            switch (name) {
                case 'Login':
                    return { showMore: false };
                    break;
                default:
                    return { showMore: true };
            }
        },
    },
    mounted() {
    },
    watch: {
        '$route' (to, from) {
            if (to.name === 'List') {
                setTimeout(() => {
                    if (from.name === 'Detail') {
                        var scrollTop = this.$store.getters.getScrollTop;
                        this.$refs.viewBox.scrollTo(scrollTop);
                    } else {
                        this.scrollTopInit();
                    }
                    this.box = this.$refs.viewBox.getScrollBody();
                    if (this.box) {
                        this.box.removeEventListener('scroll', this.handler, false)
                        this.box.addEventListener('scroll', this.handler, false)
                    }
                })
            } else {
                this.box && this.box.removeEventListener('scroll', this.handler, false)
            }
        }
    }
};

</script>
<style lang='less'>
@import '~vux/src/styles/reset.less';
@import '~vux/src/styles/1px.less';
@import '~vux/src/styles/tap.less';



html,
body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
}
body {
    background-color: #fbf9fe;
}
#app {
    height: 100%;
}

</style>
