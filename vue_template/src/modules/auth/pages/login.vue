<template>
    <div>
        <group>
            <x-input title="账号" type="text" placeholder="请输入账号" v-model="id" label-width='80' text-align='left'></x-input>
            <x-input title="密码" type="password" placeholder="请输入密码" v-model="password" label-width='80' text-align='left'></x-input>
        </group>
        <br>
        <x-button :text="submitBtnText" :disabled="enableSubmit" :show-loading="submitStatus" @click.native="login" type="mx_ui"></x-button>
    </div>
</template>
<script>
import { Cell, Group, Badge, Divider, XInput, XButton, AlertModule } from 'vux'
import { mapActions, mapGetters } from 'vuex'
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
            return this.submitStatus ? true : (!this.id || !this.password)
        },
        submitBtnText() {
            return this.submitStatus ? '登录中' : '登录'
        }
    },
    methods: {
        ...mapActions({
            loginAction: 'login'
        }),
        ...mapGetters({
            token: 'getToken'
        }),
        login() {
            var vm = this;
            vm.submitStatus = true;
            vm.loginAction({
                id: vm.id,
                password: vm.password
            })
            .then(() => vm.$router.push('/dashBoard'))
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
        this.token() && this.$router.push('/dashBoard/moduleA');
    },
    // watch: {
    //     token(newV, oldV) {
    //         console.log('token change ->', newV);
    //         if (newV) {
    //             this.$router.push('query');
    //         }
    //     }
    // }
}

</script>
<style scoped>

.center {
    margin-top: 15px;
    text-align: center;
}


</style>
