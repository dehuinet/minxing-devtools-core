<template>
    <div>
        <group>
            <div class="title">请选择需要查询的栏目</div>
            <popup-radio title="栏目" :options="options" v-model="option" placeholder="请选择"></popup-radio>
        </group>
        <x-button class="m-top" :text="submitBtnText" :disabled="!option" @click.native="query" type="primary"></x-button>
    </div>
</template>
<script>
import { Group, PopupRadio, XButton } from "vux";
import { mapActions, mapGetters } from "vuex";
export default {
  components: {
    Group,
    PopupRadio,
    XButton
  },
  data() {
    return {
      submitBtnText: "查询",
      option: "",
      options: [
        {
          key: 20,
          value: "全行要闻"
        },
        {
          key: 22,
          value: "领导讲话"
        },
        {
          key: 23,
          value: "总部动态"
        },
        {
          key: 24,
          value: "分支行工作动态"
        }
      ]
    };
  },
  methods: {
    ...mapActions({
      getListFn: "getListFn"
    }),
    query() {
      var vm = this;
      vm.getListFn({
        cate: vm.option
      });
      vm.$router.push({
        path: "list",
        query: {
          cate: vm.option
        }
      });
    }
  }
};
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
