import { writable } from "svelte/store";

class Store {
    edit_mode = $state(false);
    non_map_informatic_id = writable<number | null>(null)
    show_modal = $state(false);
}

export const store = new Store()
