import Vue from 'vue';
import axios from 'axios'
import { baseURL } from '../config';
import store from '../store'

const axiosInstance = axios.create({
	baseURL: '/',
	timeout: 1000
})
// axiosInstance.interceptors.request.use(function(config) {
// 	if (store.state.user.token) {
// 		config.headers.token = store.state.user.token;
// 	}
// 	return config;
// }, function(error) {
// 	return Promise.reject(error)
// });

// axiosInstance.interceptors.response.use(function(response) {
// 	return response
// }, function(error) {
// 	var msg = ['抱歉', '服务器有点累,请您稍后重试']
// 	// 响应状态码
// 	switch (error.response.status) {
// 		case 400: {
// 			msg = ['抱歉', '请尝试刷新浏览器或者返回用户首页']
// 			break;
// 		}
// 		case 401: {
// 			msg = ['抱歉', '您未获得操作此类资源的授权']
// 			break;
// 		}
// 		case 404: {
// 			msg = ['抱歉', '您访问的某些资源不存在或者已经被移除']
// 			break;
// 		}
// 	}
// 	return Promise.reject(error)
// });
// Vue.http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default axiosInstance;

