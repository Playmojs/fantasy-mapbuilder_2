import { get } from "svelte/store";
import { store } from "../store.svelte"
import { page } from "$app/stores";

export const getCurrentMapId = () => {
    return +get(page).params.map_id;
}

export const getCurrentArticleId = () => { return store.non_map_informatic_id ?? store.maps[getCurrentMapId()]?.informatic_id }
