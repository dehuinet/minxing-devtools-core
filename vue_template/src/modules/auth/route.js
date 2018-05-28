import Auth from './index.vue';
import Login from './pages/login';
import Register from './pages/register';

export default {
    name: 'Auth',
    path: '/auth',
    redirect: '/auth/login',
    component: Auth,
    children: [{
        path: 'login',
        name: 'login',
        component: Login
    }, {
        path: 'register',
        name: 'register',
        component: Register
    }]
}