<template>
    <div>
        <div v-if="detail" style="padding: 10px">
            <h3>{{detail.title}}</h3>
            <div class="desc">发布&nbsp;&nbsp;{{detail.writeDate}}&nbsp;&nbsp;{{detail.creater}}</div>
            <div v-if="detail.modifiedDate" class="desc">修改&nbsp;&nbsp;{{detail.modifiedDate}}&nbsp;&nbsp;{{detail.creater}}</div>
            <div v-html="detail.content"></div>
        </div>
    </div>
</template>
<script>
import { XHeader, Divider, Loading, TransferDomDirective as TransferDom } from 'vux';
import { mapGetters, mapActions } from 'vuex'
export default {
    directives: {
        TransferDom
    },
    components: {
        XHeader,
        Divider,
        Loading
    },
    data() {
        return {
        }
    },
    methods: {
        ...mapActions({
            getDetailFn:'getDetailFn'
        }),
        ...mapGetters({
            getDetail:'getDetail'
        })
    },
    computed: {
        detail() {
            return this.getDetail();
        }
    },
    created() {
        var vm = this;
        const id = vm.$route.params.appId;
        vm.$vux.loading.show({
             text: 'Loading'
            })
        vm.getDetailFn({id}).then(function() {
            vm.$vux.loading.hide()
        });
    },
};

</script>
<style scoped>
.desc {
    font-size: 14px;
    color: #999;
    line-height: 24px;
}

</style>
