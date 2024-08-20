import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { type Article, type MapData, type MarkerData } from "$lib/types";

const supabaseUrl = "https://ybazluanarelyccrfuuc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYXpsdWFuYXJlbHljY3JmdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1NDgyMTYsImV4cCI6MjAzOTEyNDIxNn0.hUbetjxp4zUMXS4C7wosekpD8CtJwpPU0jOOLyAxzt8";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export let map_cache: { [id: number]: MapData } = {};
let marker_cache: { [id: number]: MarkerData } = {};
export let article_cache: { [id: number]: Article } = {};
let all_fetched: boolean = false;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default {
    async get_map(map_id: number) {
        if (map_id in map_cache) {
            return map_cache[map_id];
        }
        return await supabase
            .from('map')
            .select()
            .eq('id', map_id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch map data for ${map_id}, error was: ${error}`);
                }
                if (data) {
                    map_cache[map_id] = data;
                    return data
                }
            });
    },

    async get_markers(marker_ids: number[]) {
        const unloaded_marker_ids = marker_ids.filter(id => id in marker_cache);
        const loaded_markers: MarkerData[] = marker_ids.map(id => marker_cache[id]).filter(marker => marker !== undefined) as MarkerData[];
        if (unloaded_marker_ids.length === 0) {
            return loaded_markers;
        }
        return await supabase
            .from('marker')
            .select()
            .in('id', unloaded_marker_ids)
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch marker data for ${marker_ids}, error was: ${error}`);
                }
                if (data) {
                    data.forEach(marker => marker_cache[marker.id] = marker);
                    return data.concat(loaded_markers);
                }
            });
    },

    async get_article(article_id: number) {
        if (article_id in article_cache) {
            return article_cache[article_id];
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
                    article_cache[article_id] = data;
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
                    data.forEach(map => map_cache[map.id] = map);
                }
            });
        await supabase
            .from('marker')
            .select()
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch marker data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(marker => marker_cache[marker.id] = marker);
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
                    data.forEach(article => article_cache[article.id] = article);
                }
            });
        all_fetched = true;
    }
}

// const load_map = async (map_id: number) {
//get_map
// set global map to map
// for all neighboring stuff load if not in cache
// }