<template>
    <div>
        <div class="center">
            <img style="width:60px;height:60px;" src="../assets/icon.png" alt="">
        </div>
        <group>
            <x-input title="工号" type="text" placeholder="请输入工号" v-model="id" label-width='80' text-align='left'></x-input>
            <x-input title="密码" type="password" placeholder="请输入密码" v-model="password" label-width='80' text-align='left'></x-input>
        </group>
        <x-button :text="submitBtnText" :disabled="enableSubmit" :show-loading="submitStatus" @click.native="login" type="primary"></x-button>
    </div>
</template>
<script>
import { Cell, Group, Badge, Divider, XInput, XButton, AlertModule } from 'vux'
import { login } from '../http/login';
export default {
    components: {
        Cell,
        Group,
        Badge,
        Divider,
        XInput,
        XButton,
        AlertModule
    },
    data() {
        return {
            submitStatus: false,
            id: '001170',
            password: '123456',
        }
    },
    computed: {
        enableSubmit() {
            return ((!this.id && !this.password) || this.submitStatus)
        },
        submitBtnText() {
            return this.submitStatus ? '登录中' : '登录'
        }
    },
    methods: {
        login() {
            var vm = this;
            vm.submitStatus = true;
            vm.$store.dispatch('loginFn', {
                id: vm.id,
                password: vm.password
            })
            .then(() => vm.$router.push('query'))
            .catch(e => {
                        vm.$vux.toast.show({
                            type:'text',
                            time:'4000',
                            text: e.error
                        });
                        vm.submitStatus = false
            });
        }
    },
    created() {
        this.$store.state.user.token && this.$router.push('query');
    }
}

</script>
<style scoped>

.center {
    margin-top: 15px;
    text-align: center;
}


</style>
