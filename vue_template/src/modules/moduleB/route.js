import moduleB from './index.vue';
import Query from './pages/query.vue'
import List from './pages/list.vue';
import Detail from './pages/detail.vue';


export default {
    path: 'moduleB',
    redirect: 'moduleB/query',
    name: 'moduleB',
    component: moduleB,
    children: [
        {
            path: 'query',
            name: 'moduleBQuery',
            component: Query,
        }, 
        {
            path: 'list',
            name: 'moduleBList',
            component: List        
        },
        {
            path: 'detail/:songId',
            name: 'moduleBDetail',
            component: Detail
        }
    ]
}