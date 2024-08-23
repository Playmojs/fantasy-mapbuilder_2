import { type Article, type MapData, type MarkerData, type ModalData } from "$lib/types";
import { readable, writable } from "svelte/store";

class Store {
    // Client only
    edit_mode = $state(false);
    show_modal = $state(false);
    informatic_minimized = $state(false);
    is_panning = $state(false);
    selected_marker = $state<number | null>(null); // TODO: Could this be a MarkerData instead of an id?
    informatic_width = $state(66);
    text_size = $state(150);
    modal_data = $state<ModalData | null>(null);
    map_transform = $state({ x: 0, y: 0, scale: 1 });

    // From database
    map = $state<MapData>(default_map);
    markers = $state<MarkerData[]>([]);
    article = $state<Article>(default_article);

    map_cache = $state<{ [id: number]: MapData }>({});
    article_cache = $state<{ [id: number]: Article }>({});
}

const default_map: MapData = { article_id: -1, title: "", created_at: "", id: -1, image: "", marker_ids: [], parent_id: null, parent_image: null }
const default_article: Article = { id: -1, title: "", created_at: "", content: "", image: null }

export const store = new Store()
