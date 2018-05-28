// import http from 'axios'
import http from './config'

export function getList({
    id,
    page,
    limit,
    cate
}) {
    const url = `api/list`;
    const params = {
        author: id,
        _page: page,
        _limit: limit,
        cate
    };
    var metaMaps = {
        'source': 'source',
        'writeDate': 'date'
    }
    return http.get(url, {
            params
        })
        .then(({
            data
        }) => {
            return data.map((item) => {
                return {
                    id: item.id,
                    author: item.author,
                    cate: item.cate,
                    data: item.data,
                    title: item.data.title,
                    meta: {
                        source: item.data.source,
                        date: item.data.writeDate,
                    }
                }
            });
        });
};


export function getDetail({
    id
}) {
    const url = `api/list`;
    const params = {
        id
    };
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            http.get(url, {
                    params
                })
                .then(({
                    data
                }) => {
                    resolve(data[0].data)
                });
        }, 1000);
    })
}
