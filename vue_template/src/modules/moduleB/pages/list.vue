<template>
  <div>
    <panel :list="list" :type="type" @on-click-item="checkDetail"></panel>
    <!-- <panel :header="titile" :list="list" :type="type" @on-click-item="checkDetail"></panel> -->
    <div @click='loadMore'>
      <load-more :show-loading="showLoading" :tip="tip"></load-more>
    </div>
  </div>
</template>
<script>
import { Panel, LoadMore } from "vux";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  components: {
    Panel,
    LoadMore
  },
  data() {
    var vm = this;
    return {
      type: "1",
      showLoading: false
    };
  },
  methods: {
    ...mapActions({
      getSongListFn: "getSongListFn",
      getSongMoreList: "getSongMoreList"
    }),
    ...mapGetters({
      getSongListFull: "getSongListFull",
      getSongListData: "getSongListData"
    }),

    checkDetail(item) {
      this.$router.push("detail/" + item.songid);
    },
    loadMore() {
      var vm = this;
      console.log('vm==>>',vm)
      var _full = vm.getSongListFull();
      if (!vm.showLoading && !_full) {
        vm.showLoading = true;
        vm.getSongMoreList().then(function(res) {
          vm.showLoading = false;
        });
      }
    }
  },
  computed: {
    list() {
      return this.getSongListData();
    },
    tip() {
      if (this.showLoading) {
        return "正在加载";
      }
      return this.getSongListFull() ? "暂无更多数据" : "点击加载更多数据";
    }
  },
  created() {
    var vm = this;
    var seconds = vm.$route.query.cate;
    if (seconds) {
      vm.getSongListFn({
        cate: seconds
      });
    }else{
      vm.$router.push('/dashBoard/moduleB/query')
    }
  }
};
</script>
<style scoped>

</style>
