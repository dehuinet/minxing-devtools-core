import DashBoard from './index.vue';
import {route as moduleARouter} from '../moduleA'
import {route as moduleBRouter} from '../moduleB'

export default {
    path: '/dashBoard',
    name: 'dashBoard',
    redirect: '/dashBoard/moduleA',
    component: DashBoard,
    children: [moduleARouter, moduleBRouter]
}