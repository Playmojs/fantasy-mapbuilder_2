import { writable } from "svelte/store";
import { type SpecialEntity } from "$lib/types";


class Store {
    edit_mode = $state(false);
    non_map_informatic_id = writable<number | null>(null)
    show_modal = $state(false);
    minimized = $state(false);
    is_panning = $state(false)
    informatic_width = $state(66);
}

export let add_map: SpecialEntity =
{
    image: "/assets/plus.png",
    title: "Add Map",
    func: () => { console.log('Map added :)') }
}

export const store = new Store()
