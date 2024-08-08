import { derived, get, readable } from "svelte/store";
import { store } from "../store.svelte"
import { page } from "$app/stores";

export const current_map_id = derived(page, (page) => +page.params.map_id)
export const current_article_id = derived([current_map_id, store.non_map_informatic_id],
    ([current_map_id, non_map_informatic_id]) => { return (non_map_informatic_id ?? store.maps[current_map_id]?.informatic_id) })


export const getModalEntityMaps = () => {
    return Object.entries(store.maps).map(([id, map]) => {
        return {
            image: map.image,
            title: map.title,
            func: () => {
                store.maps[get(current_map_id)].parent_id = +id;
                store.maps[get(current_map_id)].parent_image = store.maps[+id].image;
            }
        };
    })
}

export const getModalEntityArticles = () => {
    return Object.entries(store.articles).map(([id, map]) => {
        return {
            image: map.image,
            title: map.title,
            func: () => {
                store.maps[get(current_map_id)].parent_id = +id;
                store.maps[get(current_map_id)].parent_image = store.maps[+id].image;
            }
        };
    })
}
