<template>
    <div id="app">
        <drawer width="200px;" :show.sync="drawerVisibility" :show-mode="showModeValue" :placement="showPlacementValue" :drawer-style="{'background-color':'#183361', width: '200px'}">
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
                <group title="ModuleA">
                    <cell title="ModuleA" @click.native="ModuleDemoA"></cell>
                </group>
                <group title="ModuleB">
                    <cell title="ModuleB" @click.native="ModuleDemoB"></cell>
                </group>
                <group title="MX js api">
                    <cell title="选人组件" @click.native="selectUsers"></cell>
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
import { MXSelectUsers } from '../../core/mxApi';
import { Radio, Drawer, Group, Cell, ViewBox, XHeader, Toast } from 'vux';
import { LIST_SCROLL_TOP, AUTH_LOGOUT } from "../moduleA/store/types"
import { mapActions, mapGetters, mapMutations } from 'vuex'
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
        ...mapActions({
            logoutFn:'logout'
        }),
        ...mapGetters({
            getScrollTop:'getScrollTop'
        }),
        ...mapMutations({
            LIST_SCROLL_TOP
        }),
        clickMenu(fn) {
            fn();
            this.drawerVisibility = false;
        },
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
            this.LIST_SCROLL_TOP({
                scrollTop
            })
        },
        scrollTopInit() {
            this.LIST_SCROLL_TOP({
                scrollTop: 0
            })
        },
        logOut() {
            this.logoutFn();
            this.$router.push('/auth');
            this.drawerVisibility = false;
        },
        ModuleDemoA(){
            this.$router.push('/dashBoard/moduleA');
            this.drawerVisibility = false;
        },
        ModuleDemoB(){
            this.$router.push('/dashBoard/moduleB/query');
            this.drawerVisibility = false;
        },
        selectUsers() {
            this.clickMenu(() => MXSelectUsers().then(result => alert(JSON.stringify(result))))
        }
    },
    computed: {
        leftOptions() {
            var vm = this;
            let name = this.$route.name
            switch (name) {
                case 'moduleAQuery':
                    vm.title = 'moduleA/查询';
                    return { showBack: false };
                    break;
                case 'moduleAList':
                    vm.title = 'moduleA/列表';
                    return { showBack: true };
                    break;
                case 'moduleADetail':
                    vm.title = 'moduleA/详情';
                    return { showBack: true };
                    break;
                case 'moduleBQuery':
                    vm.title = 'moduleB/查询';
                    return { showBack: false };
                    break;
                case 'moduleBList':
                    vm.title = 'moduleB/列表';
                    return { showBack: true };
                    break;
                case 'moduleBDetail':
                    vm.title = 'moduleB/详情';
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
                // case 'Login':
                //     return { showMore: true };
                //     break;
                default:
                    return { showMore: true };
            }
        },
    },
    mounted() {
    },
    watch: {
        '$route' (to, from) {
            if (to.name === 'moduleAList' || to.name === 'moduleBList') {
                setTimeout(() => {
                    if (from.name === 'moduleADetail' || from.name === 'moduleBDetail') {
                        var scrollTop = this.getScrollTop();
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
