import { auth } from '@/core/api';
import {LOGIN, LOGOUT } from './types';
import Vue from 'vue';

const ls = window.localStorage;

export default {
    login: ({
        commit,
        state
    }, payload) => {
        return auth.login(payload)
            .then(user => {
                ls['VUE_DEMO_USER'] = JSON.stringify(user);
                commit(LOGIN, user);
            });
    },
    logout: ({
        commit,
    }) => {
        delete ls['VUE_DEMO_USER'];
        commit(LOGOUT);
    }
}