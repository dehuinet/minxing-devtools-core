<template>
    <div>
        <panel :header="titile" :list="list" :type="type" @on-click-item="checkDetail"></panel>
        <div @click='loadMore'>
            <load-more :show-loading="showLoading" :tip="tip"></load-more>
        </div>
    </div>
</template>
<script>
import { Panel, LoadMore } from "vux";
import * as types from "../store/types.js";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    Panel,
    LoadMore
  },
  data() {
    var vm = this;
    return {
      type: "4",
      showLoading: false
    };
  },
  methods: {
    ...mapActions({
      getListFn: "getListFn",
      getMoreList: "getMoreList"
    }),
    ...mapGetters({
      getFull: "getFull",
      getListQuery: "getListQuery",
      getListData: "getListData"
    }),
    checkDetail(item) {
      var vm = this;
      vm.$router.push("detail/" + item.id);
    },
    loadMore() {
      var vm = this;
      var _full = vm.getFull();
      if (!vm.showLoading && !_full) {
        vm.showLoading = true;
        vm.getMoreList().then(function(res) {
          vm.showLoading = false;
        });
      }
    }
  },
  computed: {
    list() {
      return this.getListData();
    },
    titile() {
      var vm = this;
      switch (vm.getListQuery().cate) {
        case 20:
          return "全行要闻";
          break;
        case 22:
          return "领导讲话";
          break;
        case 23:
          return "总部动态";
          break;
        case 24:
          return "分支行工作动态";
          break;
        default:
          return "新闻列表";
      }
    },
    tip() {
      if (this.showLoading) {
        return "正在加载";
      }
      return this.getFull() ? "暂无更多数据" : "点击加载更多数据";
    }
  },
  created() {
    var vm = this;
    if(vm.$route.query.cate){
        // vm.getListFn({
        //     cate:vm.$route.query.cate
        // });
    }else{
        vm.$router.push('/dashBoard/moduleA/query')
    }
  }
};
</script>
<style scoped>
.xInput {
  position: relative;
  top: -10px;
}
</style>
