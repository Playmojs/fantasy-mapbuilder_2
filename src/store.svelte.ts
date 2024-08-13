import { type Article, type MapData, type MarkerData, type ModalData } from "$lib/types";
import { readable, writable } from "svelte/store";

class Store {
    // Client only
    edit_mode = $state(false);
    show_modal = $state(false);
    minimized = $state(false);
    is_panning = $state(false);
    selected_marker = $state<number | null>(null);
    informatic_width = $state(66);
    text_size = $state(150);
    modal_data = $state<ModalData | null>(null);

    // From database
    map = $state<MapData>();
    markers = $state<MarkerData[]>([]);
    article = $state<Article>();
}


export const store = new Store()
