<template>
	<div id="wrap">
		<div ng-if="detail">
			<div class="imgWrap">
				<img :src="detail.src" alt="">
			</div>
			<audio controls src="http://m10.music.126.net/20180426212849/da0eb016ec813001dd9396e19b5a74bc/ymusic/ed1b/ded5/ba47/8f6bec7e55a47fb37c343fa551592ab2.mp3">您的浏览器不支持 audio 标签。</audio>
		</div>
	</div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
	data() {
		return {
			};
	},
	methods: {
		...mapActions({
			getSongDetailFn: 'getSongDetailFn'
		}),
		...mapGetters({
			getSongDetail:'getSongDetail'
		})
	},
	computed: {
		detail() {
			var vm = this;
			if(vm.getSongDetail()){
				return vm.getSongDetail();
			}
            return false;
        }
	},
	created() {
		var vm = this;
        const id = vm.$route.params.songId;
        vm.$vux.loading.show({
             text: 'Loading'
            })
        vm.getSongDetailFn({id}).then(function(res) {
            vm.$vux.loading.hide()
        });
	}
};
</script>
<style scoped>
#wrap {
  text-align: center;
}
.imgWrap {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  margin: 10px auto;
}
</style>

