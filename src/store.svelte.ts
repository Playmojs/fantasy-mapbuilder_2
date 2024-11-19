import { type Article, type MapData, type MarkerData, type ModalType, type Project, type Category } from "$lib/types";
import type { User } from "@supabase/supabase-js";
import { untrack } from "svelte";
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
    //modal_data = $state<ChooseModalData | null>(null);
    map_transform = $state({ x: 0, y: 0, scale: 1 });
    user = $state<User | null>(null);
    project_id: number = 0;
    write_access = writable(false);
    //edit_map_window = $state<UploadModalData | null>(null);
    //confirm_modal = $state<ConfirmModalData | null>(null);
    modals = $state<ModalType[]>([])

    map_article_link=$state<number | null>()

    // From database
    map = $state<MapData>(default_map);
    theme = $state<number>(0);
    
    map_cache = $state<{ [id: number]: MapData }>({});
    article_cache = $state<{ [id: number]: Article }>({});
    marker_cache = $state<{[map_id: number] : MarkerData[]}>({});
    project_cache = $state<{ [id: number]: Project }>({});
    category_cache = $state<{[id: number]: Category}>({});
    
    project_images = $state<{ [id: number]: string }>({});
    image_public_urls = $state<{ [image: string]: Blob }>({});
    user_projects = $state<number[]>([]);
    
    article_category_links = $state<{[id: number]: number[]}>({});
    category_links = $state<{[id: number]: number[]}>({})
    inverted_category_links = $derived.by(()=> { let inverted_list: {[from: number]: number[]} = {}
        Object.entries(this.category_links).forEach(([from, tos]) => {tos.forEach(to => {
                if(to in inverted_list){
                    inverted_list[to].push(+from)
                }
                else{
                    inverted_list[to] = [+from]
                }
            })
        })
    return inverted_list;})
    inv_cat_test = $state<{[id: number]: number[]}>({})
    
    markers = $derived<MarkerData[]>(this.marker_cache[this.map.id] ?? [])
    article_history = $state<number[]>([]);
    undone_articles = $state<number[]>([]); 
    article = $derived.by<Article>(() => {const id = this.article_history.at(-1); return (id === undefined || !this.article_cache[id]) ? default_article :  {...this.article_cache[id]}});
}

const default_map: MapData = { article_id: -1, title: "", created_at: "", id: -1, image: "map.jpg", parent_id: null, parent_image: null, project_id: 0 }
const default_article: Article = { id: -1, title: "", created_at: "", content: "", image: null, project_id: 0, main_category: 0 }

export const store = new Store()
