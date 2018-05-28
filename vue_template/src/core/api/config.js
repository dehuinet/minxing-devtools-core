import axios from 'axios'

import store from '../store'

// 创建axios实例
axios.defaults.baseURL = process.env.baseURL;
axios.defaults.timeout = 15000;

const axiosInstance = axios.create({
    baseURL: process.env.baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
})

// request拦截器
axios.interceptors.request.use(
    config => {
        console.log('config', config);
        return config;
    },
    error => {

    }
)

// response拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return error;
    }
)

export default axiosInstance;
