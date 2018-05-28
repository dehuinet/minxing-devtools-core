<template>
    <div class="auth-wrap">
        <div>
            <img src="../../share/assets/mx_logo.png" alt="敏行logo">
        </div>
        <div class="router-view">
            <router-view></router-view>
        </div>
        <p @click="changeName">{{loginAndRegister}}</p>
    </div>
</template>

<script>
    import { hideWebViewTitle } from '../../core/mxApi'
    export default {
        data() {
            return {
                flag: true
            }
        },
        components: {
        },
        methods: {
            changeName() {
                var vm = this;
                vm.flag = !vm.flag;
                console.log(vm.flag);
                if(vm.flag){
                    vm.$router.replace('/auth/login');
                }else{
                    vm.$router.replace('/auth/register');
                }
            }
        },
        computed: {
            loginAndRegister(){
                return this.flag ? '注册' : '登录'
            }
        },
        created(){
            hideWebViewTitle()
        }
    }
</script>

<style scoped>
.auth-wrap > div{
    padding-top: 70px;
    text-align: center;
}
.auth-wrap > div > img{
    width: 25%;
}
.auth-wrap > p {
    width: 93%;
    margin-top: 20px;
    text-align: right;
}
.router-view{
    width: 90%;
    margin: 0 auto;
}
</style>