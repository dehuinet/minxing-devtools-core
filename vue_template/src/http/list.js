import { baseURL } from '../config';
import http from './index';
import store from '../store'



export function getList({id, page, limit, cate}) {
    const url = `api/list`;
	const params = {author: id, _page: page, _limit: limit, cate};
	var metaMaps = {
		'source': 'source',
		'writeDate': 'date'
	}
    return http.get(url, { params })
		.then(({ data }) => {
			return data.map(item => item.data.reduce((acc, cur) => {
				if (cur.title in metaMaps) {
					return {
						...acc,
						meta: {
							...acc.meta,
							[metaMaps[cur.title]]: cur.value
						}
					}
				}
				return {
					...acc,
					[cur.title]: cur.value
				}
			}, { meta:{}, id: item.id, author: item.author }));
		});
};


export function getDetail({id}) {
    const url = `api/list`;
	const params = {id};
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			http.get(url, {params})
				.then(({ data }) => {
					resolve (data[0].data.reduce((acc, cur) => {
						return {
							...acc,
							[cur.title]: cur.value
						}
					}, {}))
				});
				}, 1000);
	})
    // return http.get(url, {params})
    //     .then(({ data }) => {
	// 		return data[0].data.reduce((acc, cur) => {
	// 			return {
	// 				...acc,
	// 				[cur.title]: cur.value
	// 			}
	// 		}, {})
    //     });
}