export default  {
    path: 'moduleA',
    redirect: 'moduleA/query',
    name: 'moduleA',
    component: () => import('@/modules/moduleA/index.vue'),
    children: [
        {
            path: 'query',
            name: 'moduleAQuery',
            component: () => import('@/modules/moduleA/pages/query.vue'),
        }, 
        {
            path: 'list',
            name: 'moduleAList',
            component: () => import('@/modules/moduleA/pages/list.vue')
        },
        {
            path: 'detail/:appId',
            name: 'moduleADetail',
            component: () => import('@/modules/moduleA/pages/detail.vue')
        }
    ]
}