import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { type Article, type Folder, type MapData, type MarkerData, type Project } from "$lib/types";
import { store } from '../store.svelte';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = "https://ybazluanarelyccrfuuc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYXpsdWFuYXJlbHljY3JmdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1NDgyMTYsImV4cCI6MjAzOTEyNDIxNn0.hUbetjxp4zUMXS4C7wosekpD8CtJwpPU0jOOLyAxzt8";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}


let all_fetched_from_project: boolean = false;
let all_projects_fetched: boolean = false;
let my_project_ids_fetched: boolean = false;

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
    async get_project(project_id: number) {
        if (project_id in store.project_cache) {
            return { ...store.project_cache[project_id] };
        }
        const response = await supabase.from('project').select().eq('id', project_id).single();
        if (response.error) { console.error(response); }
        if (response.data) {
            store.project_cache[project_id] = response.data;
            return response.data
        }
    },


    async get_map(project_id: number, map_id: number) {
        if (map_id in store.map_cache) {
            this.update_image_blob(store.map_cache[map_id].image, 'maps');
            return { ...store.map_cache[map_id] };
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
            this.update_image_blob(store.map_cache[map_id].image, 'maps');
            return data;
        }
    },

    async update_image_blob(image: string, folder: Folder) {
        if (image in store.image_public_urls) { return; }
        const filePath = `${store.project_id}/${folder}/${image}`;
        const { data, error } = await supabase.storage.from('project').download(filePath);
        if (error) {
            console.error('Error downloading file:', error.message);
            return;
        }
        if (data) {
            store.image_public_urls[image] = data;
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
            if (store.article_cache[article_id].image !== null) {
                this.update_image_blob(store.article_cache[article_id].image, 'articles');
            }
            return { ...store.article_cache[article_id] };
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
                    if (data.image !== null) {
                        this.update_image_blob(data.image, 'articles');
                    }
                    store.article_cache[article_id] = data;
                    return data
                }
            });
    },

    async fetch_project_images(projects: Project[]) {
        if (all_projects_fetched) { return; }

        for await (const project of projects) {
            await supabase.from('map').select('image').eq('id', project.head_map_id).single().then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch project images, error was: ${error}`);
                }
                if (data) {
                    store.project_images[project.id] = data.image;
                    this.update_image_blob(data.image, 'maps');
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
                this.fetch_project_images(Object.values(store.project_cache));
            }
        })
        all_projects_fetched = true;
    },

    async get_my_project_ids() {
        if (my_project_ids_fetched || store.user === null) { return; }
        const response = await supabase.from('user_project_access').select('project_id').eq('user_id', store.user.id)
        if (response.error) {
            console.error("Error fetching user projects: ", response.error)
            return;
        }
        if (response.data) {
            store.user_projects = response.data.map((project) => project.project_id)
            my_project_ids_fetched = true;
        }
    },

    async get_projects(project_ids: number[]) {
        let uncached_projects = project_ids.filter((id) => { return !(id in store.project_cache) })
        if (uncached_projects.length === 0) { return Object.values(store.project_cache).filter((project) => { project.id in project_ids }); }
        const response = await supabase.from('project').select('*').in('id', uncached_projects)
        if (response.error) {
            console.error("Error fetching user projects: ", response.error)
        }
        if (response.data) {
            response.data.forEach((project) => { store.project_cache[project.id] = project })
            return Object.values(store.project_cache).filter((project) => { return project.id in project_ids });
        }
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
                    data.forEach(map => { store.map_cache[map.id] = map; this.update_image_blob(map.image, 'maps') });
                }
            });
        await supabase
            .from('article')
            .select()
            .eq('project_id', project_id)
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Couldn't fetch article data, error was: ${error}`);
                }
                if (data) {
                    data.forEach(article => { store.article_cache[article.id] = article; if (article.image !== null) { this.update_image_blob(article.image, 'articles') } });
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
            return data;
        }
    },

    async create_and_select_marker_in_current_map() {
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
        if (response.data) {
            store.map_cache[response.data.id] = response.data;
        }
    },

    async update_project(project: Project) {
        if (store.project_cache[project.id] === project) {
            return;
        };
        const response = await supabase.from('project').upsert(project).select().single()
        if (response.error) {
            console.error(response);
        }
        if (response.data) {
            store.project_cache[response.data.id] = response.data;
        }
    },

    async insert_new_map(image: string, title: string, article_id: number | null) {
        if (article_id === null){
            await this.create_and_show_article(title);
            article_id = store.article.id;
        }

        const response = await supabase.from('map').insert({ article_id: article_id, image: image, title: title, project_id: store.project_id }).select().single()
        if (response.error) {
            console.error(response);
        } else { return response.data }
    },

    async upload_image(file: File, folder: Folder) {
        const image_id = uuidv4();
        const { error } = await supabase.storage
            .from('project')
            .upload(`${store.project_id}/${folder}/${image_id}`, file);
        if (error) {
            console.log(error);
            return;
        }
        return image_id;
    },

    async create_new_map(image_file: File, title: string, article_id: number | null) {
        let image_id = await this.upload_image(image_file, 'maps');
        if (!image_id) { return null; }
        let data = await this.insert_new_map(image_id, title, article_id);
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

    async delete_map(map: MapData) {
        const response = await supabase.from('map').delete().eq('id', map.id).select();
        if (response.error) {
            console.error(response)
        }
        if (response.data) {
            const file_response = await supabase.storage.from('project').remove([`${store.project_id}/maps/${map.image}`])
            if (file_response.error) {
                console.error(file_response)
            }
            if (file_response.data) {
                delete store.map_cache[map.id]
                delete store.image_public_urls[map.image]
            }
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