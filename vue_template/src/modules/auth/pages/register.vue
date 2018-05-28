<template>
    <div>
        <group>
            <x-input title="手机号" type="number" placeholder="请输入手机号" v-model="id" label-width='80' text-align='left'></x-input>
            <x-input title="验证码" type="number" placeholder="请输入验证码" v-model="password" label-width='80' text-align='left'></x-input>
        </group>
        <br>
        <x-button :text="submitBtnText" :disabled="enableSubmit" :show-loading="submitStatus" @click.native="login" type="primary"></x-button>
    </div>
</template>
<script>
import { Cell, Group, Badge, Divider, XInput, XButton, AlertModule } from 'vux'
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
            id: '',
            password: '',
        }
    },
    computed: {
        enableSubmit() {
             return this.submitStatus ? true : (!this.id || !this.password)
        },
        submitBtnText() {
            return this.submitStatus ? '注册中' : '注册'
        }
    },
    methods: {
        login() {
           
        }
    },
    created() {
       
    }
}

</script>
<style scoped>

.center {
    margin-top: 15px;
    text-align: center;
}


</style>
