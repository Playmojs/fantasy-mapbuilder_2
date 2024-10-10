import { type Article, type MapData, type MarkerData, type ModalData, type Project, type MapOptionsData, type ConfirmModal } from "$lib/types";
import type { User } from "@supabase/supabase-js";
import { readable, writable } from "svelte/store";

class Store {
    // Client only
    edit_mode = $state(false);
    show_modal = $state(false);
    informatic_minimized = $state(false);
    informatic_opened_by_marker = $state(false);
    is_panning = $state(false);
    selected_marker = $state<number | null>(null); // TODO: Could this be a MarkerData instead of an id?
    informatic_width = $state(66);
    text_size = $state(150);
    modal_data = $state<ModalData | null>(null);
    map_transform = $state({ x: 0, y: 0, scale: 1 });
    user = $state<User | null>(null);
    project_id: number = 0;
    write_access = writable(false);
    edit_map_window = $state<MapOptionsData | null>(null);
    confirm_modal = $state<ConfirmModal | null>(null);

    // From database
    map = $state<MapData>(default_map);
    markers = $state<MarkerData[]>([]);
    article = $state<Article>(default_article);

    map_cache = $state<{ [id: number]: MapData }>({});
    article_cache = $state<{ [id: number]: Article }>({});
    project_cache = $state<{ [id: number]: Project }>({});
    project_images = $state<{ [id: number]: string }>({});
    image_public_urls = $state<{ [image: string]: Blob }>({});
    user_projects = $state<number[]>([])
}

const default_map: MapData = { article_id: -1, title: "", created_at: "", id: -1, image: "map.jpg", parent_id: null, parent_image: null, project_id: 0 }
const default_article: Article = { id: -1, title: "", created_at: "", content: "", image: null, project_id: 0 }

export const store = new Store()
