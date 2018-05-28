// import http from 'axios'
import http from './config'

export function login({id, password}) {
    const url = `api/user?id=${id}`;
    
    return new Promise((resolve, reject) => {
        http.get(url)
            .then(({data}) => {
                const user = data[0];
                if (!user) {
                    reject({error: '该用户不存在！'});
                    return;
                }
                if (user.password === password) {
                    resolve({
                        id: user.id,
                        token: user.token,
                        name: user.name
                    }) 
                    return;
                } else {
                    reject({
                        error: '密码错误'
                    });
                    return;
                }
            })
            .catch(e => console.log('login error->', e));
    })
}