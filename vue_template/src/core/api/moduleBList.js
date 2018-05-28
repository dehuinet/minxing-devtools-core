// import http from 'axios'
import http from './config'

export function getSongList({
    page,
    limit,
    cate
}) {
    const url = `api/songList`;
    const params = {
        seconds: cate,
        _page: page,
        _limit: limit,
    };
    return http.get(url, {
            params
        })
        .then(({
            data
        }) => {
            return data;
        });
};


export function getSongDetail({
    id
}) {
    const url = `api/songList`;
    const params = {
        songid: id
    };
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        http.get(url, {
                    params
                })
                .then(({
                    data
                }) => {
                    resolve(data[0])
                });
        }, 1000);
    })
}
