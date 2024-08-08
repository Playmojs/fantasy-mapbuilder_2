import { goto } from "$app/navigation"
import { store } from "../store.svelte"

export const gotoMap = (map_id: number) => {
    store.non_map_informatic_id.set(null);
    goto(`/${map_id}`)
}

