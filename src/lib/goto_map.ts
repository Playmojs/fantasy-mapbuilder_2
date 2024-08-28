import { goto } from "$app/navigation"
import { store } from "../store.svelte"

export const gotoMap = (map_id: number) => {
    goto(`/projects/${store.project_id}/${map_id}`)
}