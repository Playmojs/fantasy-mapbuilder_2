import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { type Article, type MapData, type MarkerData } from "$lib/types";
import { store } from '../store.svelte';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = "https://ybazluanarelyccrfuuc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYXpsdWFuYXJlbHljY3JmdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1NDgyMTYsImV4cCI6MjAzOTEyNDIxNn0.hUbetjxp4zUMXS4C7wosekpD8CtJwpPU0jOOLyAxzt8";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}


let all_fetched_from_project: boolean = false;
let all_projects_fetched: boolean = false;

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
    async get_map(project_id: number, map_id: number) {
        if (map_id in store.map_cache) {
            this.update_map_image_blob(store.map_cache[map_id].image);
            return store.map_cache[map_id];
        }
        const response = await supabase
            .from('map')
            .select()
            .eq('project_id', project_id)
            .eq('id', map_id)
            .single();
        const { data } = response;
        if (response.error) {
            console.error(response);
        }
        if (data) {
            store.map_cache[map_id] = data;
            this.update_map_image_blob(store.map_cache[map_id].image);
            return data;
        }
    },

    async update_map_image_blob(map_image: string) {
        if (map_image in store.map_image_public_urls) { return; }
        const filePath = `${store.project_id}/maps/${map_image}`;
        const { data, error } = await supabase.storage.from('project').download(filePath);
        if (error) {
            console.error('Error downloading file:', error.message);
            return;
        }
        if (data) {
            store.map_image_public_urls[map_image] = data;
            return data
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

    async get_article(project_id: number, article_id: number) {
        if (article_id in store.article_cache) {
            return store.article_cache[article_id];
        }
        return await supabase
            .from('article')
            .select()
            .eq('project_id', project_id)
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

    async fetch_project_images() {
        if (all_projects_fetched) { return; }

        for await (const [_, project] of Object.entries(store.project_cache)) {
            await supabase.from('map').select('image').eq('id', project.head_map_id).single().then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch project images, error was: ${error}`);
                }
                if (data) {
                    store.project_images[project.id] = data.image;
                    this.update_map_image_blob(data.image);
                }
            })
        }
    },

    async fetch_all_projects() {
        if (all_projects_fetched) { return; }
        await supabase.from('project').select().then(({ data, error }) => {
            if (error) {
                console.error(`Couldn't fetch project data, error was: ${error}`);
            }
            if (data) {
                data.forEach(project => { store.project_cache[project.id] = project });
                this.fetch_project_images();
            }
        })
        all_projects_fetched = true;
    },

    async fetch_all_from_project(project_id: number) {
        if (all_fetched_from_project) {
            return;
        }
        await supabase
            .from('map')
            .select()
            .eq('project_id', project_id)
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch map data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(map => { store.map_cache[map.id] = map; this.update_map_image_blob(map.image) });
                }
            });
        await supabase
            .from('article')
            .select()
            .eq('project_id', project_id)
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch map data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(article => store.article_cache[article.id] = article);
                }
            });
        all_fetched_from_project = true;
    },

    async create_and_show_article(title: string = "Untitled") {
        const response = await supabase.from('article').insert({ project_id: store.project_id, title: title }).select().single();
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

    async insert_new_map(image: string, title: string) {
        await this.create_and_show_article(title);
        const response = await supabase.from('map').insert({ article_id: store.article.id, image: image, title: title, project_id: store.project_id }).select().single()
        if (response.error) {
            console.error(response);
        } else { return response.data }
    },

    async upload_image(file: File) {
        const image_id = uuidv4();
        const { error } = await supabase.storage
            .from('project')
            .upload(`${store.project_id}/maps/${image_id}`, file);
        if (error) {
            console.log(error);
            return;
        }
        return image_id;
    },

    async create_new_map(image_file: File, title: string) {
        let image_id = await this.upload_image(image_file);
        if (!image_id) { return null; }
        let data = await this.insert_new_map(image_id, title);
        if (!data) { return null; }
        return data
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
    },

    async check_write_access() {
        let access = false;
        if (store.user === null) {
            return access;
        }

        const { data, error } = await supabase
            .from('user_project_access')
            .select()
            .eq('user_id', store.user.id)
            .eq('project_id', store.project_id);


        if (error) {
            console.error('Error checking access:', error);
        } else if (data.length > 0) {
            access = true;
        }

        return access;
    }
}
// const load_map = async (map_id: number) {
//get_map
// set global map to map
// for all neighboring stuff load if not in cache
// }