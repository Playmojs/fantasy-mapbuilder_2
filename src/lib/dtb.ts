import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { type Article, type MapData, type MarkerData } from "$lib/types";
import { store } from '../store.svelte';

const supabaseUrl = "https://ybazluanarelyccrfuuc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYXpsdWFuYXJlbHljY3JmdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1NDgyMTYsImV4cCI6MjAzOTEyNDIxNn0.hUbetjxp4zUMXS4C7wosekpD8CtJwpPU0jOOLyAxzt8";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}


let all_fetched: boolean = false;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);


supabase.auth.getSession().then(({ data }) => {
    store.user = data.session?.user ?? null;
});

supabase.auth.onAuthStateChange((event, session) => {
    if (event == 'SIGNED_IN' && session) {
        store.user = session.user;
    } else if (event == 'SIGNED_OUT') {
        store.user = null;
    }
});

export default {
    async get_map(map_id: number) {
        if (map_id in store.map_cache) {
            return store.map_cache[map_id];
        }
        const response = await supabase
            .from('map')
            .select()
            .eq('id', map_id)
            .single();
        const { data } = response;
        if (response.error) {
            console.error(response);
        }
        if (data) {
            store.map_cache[map_id] = data;
            return data;
        }
    },

    async get_markers(map_id: number): Promise<MarkerData[] | null> {
        return await supabase
            .from('marker')
            .select()
            .eq('owner_map_id', map_id)
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch marker data for ${map_id}, error was: ${error}`);
                }
                if (data) {
                    return data;
                }
                return null;
            });
    },

    async get_article(article_id: number) {
        if (article_id in store.article_cache) {
            return store.article_cache[article_id];
        }
        return await supabase
            .from('article')
            .select()
            .eq('id', article_id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch article data for ${article_id}, error was: ${error}`);
                }
                if (data) {
                    store.article_cache[article_id] = data;
                    return data
                }
            });
    },
    async fetch_all() {
        if (all_fetched) {
            return;
        }
        await supabase
            .from('map')
            .select()
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch map data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(map => store.map_cache[map.id] = map);
                }
            });
        await supabase
            .from('article')
            .select()
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch map data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(article => store.article_cache[article.id] = article);
                }
            });
        all_fetched = true;
    },

    async create_and_show_article() {
        const response = await supabase.from('article').insert({}).select().single();
        const { data } = response
        if (response.error) {
            console.error(response);
        }
        if (data) {
            store.article_cache[data.id] = data;
            store.article = data;
        }
    },

    async create_and_select_marker_in_current_map() {
        // TODO: How do we determine the type? Hardcoded to Informatic for now
        // TODO: How do we determine the x and y? Hardcoded to 50, 50 for now
        const response = await supabase.from('marker').insert({ owner_map_id: store.map.id, x: 50, y: 50 }).select().single();
        const { data } = response
        if (response.error) {
            console.error(response);
        }
        if (data) {
            store.selected_marker = data.id;
            store.markers.push(data);
        }
    },

    async update_article(article: Article) {
        store.article_cache[article.id] = article;
        const response = await supabase.from('article').upsert(article).select().single()
        if (response.error) {
            console.error(response);
        }
    },

    async update_marker(marker: MarkerData) {
        marker.x = Math.round(marker.x);
        marker.y = Math.round(marker.y);
        const response = await supabase.from('marker').upsert(marker).select().single()
        if (response.error) {
            console.error(response);
        }
    },

    async update_map(map: MapData) {
        if (store.map_cache[map.id] === map) {
            return;
        };
        const response = await supabase.from('map').upsert(map).select().single()
        if (response.error) {
            console.error(response);
        }
    },

    async delete_marker(marker_id: number | null) {
        if (marker_id === null) {
            return;
        }
        const response = await supabase.from('marker').delete().eq('id', marker_id).select();
        if (response.error) {
            console.error(response);
        }
        if (response.data) {
            store.markers = store.markers.filter(marker => marker.id !== marker_id);
        }
    }
}

// const load_map = async (map_id: number) {
//get_map
// set global map to map
// for all neighboring stuff load if not in cache
// }