<template>
    <div>
        <group>
            <div class="title">请选择需要查询的时长</div>
            <popup-radio title="时长" :options="options" v-model="option" placeholder="请选择"></popup-radio>
        </group>
        <x-button class="m-top" :text="submitBtnText" :disabled="!option" @click.native="query" type="primary"></x-button>
    </div>
</template>
<script>
import { Group, PopupRadio, XButton } from 'vux'
export default {
    components: {
        Group,
        PopupRadio,
        XButton
    },
    data() {
        return {
            submitBtnText: '查询',
            option: '',
            options: [{
                key: 1,
                value: '1秒'
            }, {
                key: 2,
                value: '2秒'
            }, {
                key: 3,
                value: '3秒'
            }, {
                key: 4,
                value: '4秒'
            }]
        }
    },
    methods: {
        query() {
            var vm = this;
            vm.$router.push({
                path:'list',
                query:{
                    cate: vm.option
                }
            });
        },
    }
}

</script>
<style scoped>
.title {
    margin-left: 0.8em;
    color: #ccc;
    font-size: 16px;
    line-height: 40px;
}

.m-top {
    margin-top: 50px;
}

</style>
