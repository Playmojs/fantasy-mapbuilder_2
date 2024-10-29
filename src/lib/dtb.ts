import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { type Article, type Folder, type MapData, type MarkerData, type Project } from "$lib/types";
import { store } from '../store.svelte';
import { v4 as uuidv4 } from 'uuid';
import { push_article } from './article_stack';
import { assert } from './utils';

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
            this.update_image_blob(project_id, store.map_cache[map_id].image, 'maps');
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
            this.update_image_blob(project_id, store.map_cache[map_id].image, 'maps');
            return data;
        }
    },

    async update_image_blob(project_id: number, image: string, folder: Folder) {
        if (image in store.image_public_urls) { return; }
        const filePath = `${project_id}/${folder}/${image}`;
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
                this.update_image_blob(project_id, store.article_cache[article_id].image, 'articles');
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
                        this.update_image_blob(project_id, data.image, 'articles');
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
                    this.update_image_blob(project.id, data.image, 'maps');
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
                    data.forEach(map => { store.map_cache[map.id] = map; this.update_image_blob(project_id, map.image, 'maps') });
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
                    data.forEach(article => { store.article_cache[article.id] = article; if (article.image !== null) { this.update_image_blob(project_id, article.image, 'articles') } });
                }
            });
        await supabase
            .from('category')
            .select('*, article_to_category(article_id), category_to_category!parent_id(child_id)')
            .eq('project_id', project_id)
            .then(({data, error}) => {
                if(error){
                    console.error(`Couldn't fetch category data, error was: ${error}`)
                }
                if(data){
                    data.forEach(category => {
                        const {article_to_category, category_to_category, ...category_data} = category
                        store.category_cache[category.id] = category_data
                        store.article_category_links[category.id] = article_to_category.map(value => value.article_id)
                        store.category_links[category.id] = category_to_category.map(value=>value.child_id)
                    })
                }

            });
        all_fetched_from_project = true;
    },

    async create_and_show_article(project_id: number, title: string = "Untitled") {
        const response = await supabase.from('article').insert({ project_id: project_id, title: title }).select().single();
        const { data } = response
        if (response.error) {
            console.error(response);
        }
        if (data) {
            store.article_cache[data.id] = data;
            push_article(data.id, false)
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

    async insert_new_map(project_id: number, image: string, title: string, article_id: number | null) {
        if (article_id === null){
            let article = await this.create_and_show_article(project_id, title);
            if(!article){
                console.error('Failed to create article, could not produce map'); 
                return}
            article_id = store.article.id;
        
        }
        const response = await supabase.from('map').insert({ article_id: article_id, image: image, title: title, project_id: project_id }).select().single()
        if (response.error) {
            console.error(response);
        } else { return response.data }
    },

    async upload_image(project_id: number, file: File, folder: Folder, image_id: string | null) {
        if(image_id === null){image_id = uuidv4()}
        const { error } = await supabase.storage
            .from('project')
            .upload(`${project_id}/${folder}/${image_id}`, file);
        if (error) {
            console.log(error);
            return;
        }
        return image_id;
    },

    async create_new_map(project_id: number, image_file: File, title: string, article_id: number | null) {
        let image_id = await this.upload_image(project_id, image_file, 'maps', null);
        if (!image_id) { return null; }
        let data = await this.insert_new_map(project_id, image_id, title, article_id);
        if (!data) { return null; }
        return data
    },

    async create_new_project(project_title: string, head_map_title: string, head_map_file: File)
    {
        const image_id = uuidv4();
        let{error, data} = await supabase.rpc('insert_project_map_article', {project_title: project_title, map_title: head_map_title, map_image: image_id, article_title: head_map_title}).single()

        if(error){
            console.error(`Failed to upload project, error: ${error.message}`)
        }
        else if (data){
            await this.upload_image(data.project_id, head_map_file, 'maps', image_id)
            return this.get_project(data.project_id)
        }
    },

    async create_category(project_id: number, category_title: string){
        let{error, data} = await supabase.from('category').insert({name: category_title, project_id: project_id}).select().single();
        if(error){console.error(`Failed to create category, error: ${error}`)}
        else if(data){
            console.log(data.id)
            store.category_cache[data.id] = data;
            return data;
        }
    },

    async insert_article_category_link(project_id: number, category_id: number, article_id: number){
        assert(project_id === store.category_cache[category_id].project_id && project_id === store.article_cache[article_id].project_id, "Project ids for category and article did not match provided project id")
        assert(!store.article_category_links[category_id] || !store.article_category_links[category_id].includes(article_id), "Article already has this category")
        const response = await supabase.from('article_to_category').insert({article_id: article_id, category_id: category_id}).select().single();
        if(response.error){console.error(`Failed to add category to article, error ${response.error}`)}
        else if (response.data){
            if(!store.article_category_links[category_id]){
                store.article_category_links[category_id] = [article_id]
            }
            else{
            store.article_category_links[category_id].push(article_id);}
        }
    },

    async delete_article_category_link(project_id: number, category_id: number, article_id: number){
        assert(project_id === store.category_cache[category_id].project_id && project_id === store.article_cache[article_id].project_id, "Project ids for category and article did not match provided project id")
        assert(store.article_category_links[category_id].includes(article_id), "Article does not have this category")
        const response = await supabase.from('article_to_category').delete().eq('article_id', article_id).eq('category_id', category_id).select().single()
        if (response.error){console.error(`Failed to delete article category link, error: ${response.error}`)}
        else if (response.data){
            store.article_category_links[category_id].splice(store.article_category_links[category_id].indexOf(article_id), 1)
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
    },

    async get_usernames_in_project(project_id: number): Promise<string[] | undefined> {
        const {error, data} = await supabase.from('user_project_access').select("user_id").eq('project_id', project_id);
        if (error){
            console.error(`Couldn't fetch user ids, error: ${error}`)
        }
        if(data){
            const ids = data.map((id)=> {return id.user_id})
            const response = await supabase.from('user_info').select('username').in('user_id', ids)
            if(response.error){
                console.error(`Couldn't fetch usernames, error: ${response.error}`)
            }
            if(response.data){
                return response.data.map((user_info) => {return user_info.username})
            }
        }
    }
}
