<script lang="ts">
	import { get_modal_entity_themes, theme_entities } from "$lib/data.svelte";
	import dtb from "$lib/dtb";
	import { push_modal, push_promise_modal } from "$lib/modal_manager";
	import type { Category, ConfirmModalData, ModalEntity, UploadModal } from "$lib/types";
	import { store } from "../../store.svelte";
	import Modal from "./Modal.svelte";

    let { close, article_id }: {close: any, article_id: number } = $props();

    const remove_category = (category_id: number) => {dtb.delete_article_category_link(store.project_id, category_id, article_id)}

    let categories = $derived<Category[]>(Object.entries(store.article_category_links).filter((value) => {return value[1].includes(article_id)}).map(([category, articles]) => {return store.category_cache[+category]}))

    const get_add_category_modal: (value: {id: number | null}) => UploadModal = (value) => {
    return {type: 'upload_modal',
        data: {
            submit_func: async (file: File | null, title: string, theme_id: number | null) => {
                if(file !== null || title === '' || title === 'Add Category'){return}
                const response = await dtb.create_category(store.project_id, title, theme_id ?? 0);
                if(response===undefined){return}
                else{value.id = response.id;}
            },
            validation_func(file: Blob | File | null, title: string) {
                return title !== '';
            },
            link_func: async (val) => {await push_promise_modal({type: 'choose_modal', data: {Themes: get_modal_entity_themes(val)}, use_search: true})},
            button_title: 'Create Category',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: {id: null, title: ""},
            allow_no_file: null}};
    }

    const edit_category_modal: (category: Category) => UploadModal = (category: Category) => {
    return {type: 'upload_modal',
        data: {
            submit_func: async (file: File | null, title: string, theme_id: number | null) => {
                if(title === '' || title === 'Add Category'){return}
                category.name = title;
                category.theme_id = theme_id ?? 0
                await dtb.update_category(category)
            },
            validation_func(file: Blob | File | null, title: string, link_id: number | null) {
                return title !== '' && !(title === category.name && link_id === category.theme_id);
            },
            link_func: async (val) => {await push_promise_modal({type: 'choose_modal', data: {Themes: get_modal_entity_themes(val)}, use_search: true})},
            button_title: 'Update Category',
            initial_image_blob: null,
            initial_map_title: category.name,
            initial_link: {id: category.theme_id, title: theme_entities[category.theme_id].title},
            allow_no_file: null}};
    }

    const open_filtered_category_modal = async () => {
        const a_id = article_id;
        const add_category: ModalEntity = {image: null, title: 'Create New Category', on_click: async () => {
            let value: {id: number | null} = {id: null};
            await push_promise_modal(get_add_category_modal(value));
            if(value.id !== null){
                await dtb.insert_article_category_link(store.project_id, value.id, a_id)
            }
        }}
        
        const modal_entities: ModalEntity[] = [add_category].concat(Object.values(store.category_cache)
            .filter((category) => {return !categories.includes(category)})
            .map((category)=>{return {image: null, title: category.name, on_click: ()=>{dtb.insert_article_category_link(store.project_id, category.id, a_id)}, optional_func: ()=>{push_modal(edit_category_modal({...category}))}}}))
        push_promise_modal({type: 'choose_modal', data: {Categories: modal_entities}, use_search: true})
    }

    async function toggle_main_category(category_id: number){
        let article = await dtb.get_article(store.project_id, article_id);
        if(!article){return;}
        const new_main_category_id: number | null = category_id === article.main_category ? null : category_id;
        article.main_category = new_main_category_id;
        dtb.update_article(article);
        
    }

</script>

<div id='title_row'>
    <h1>Categories</h1>
    <button id='add_article_category_link' onclick={open_filtered_category_modal}>Add Category</button>
</div>
<div id="category_grid">
	{#each categories as category}
        <div class="category_display" style='background-image: url("{theme_entities[category.theme_id].image}");'>
            <input class='category_checkbox' type="checkbox" checked={category.id === store.article_cache[article_id].main_category} onchange={()=> {toggle_main_category(category.id)}}/>
            <p class="category_name">{category.name}</p>
            <button class='option_button' onclick={(e: Event)=>{push_modal(edit_category_modal(category))}}>
            </button>	
            <span class="close" onclick={()=>{remove_category(category.id)}}>&times;</span>
        </div>
    {/each}
</div>

<style>

    #title_row{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 96%;
        margin: 0px 2%;
    }

    #add_article_category_link{
        color: var(--main_white);
        font-size: large;
        padding: 10px;
        border-radius: 10px;
        background-color: var(--main_green);
        border: none;
        box-shadow: 5px 5px 5px rgb(10, 10, 10);
        cursor:pointer;
    }

    #add_article_category_link:active{
        box-shadow: inset 1px 1px 1px rgb(40, 40, 40);
    }

    #category_grid{
        position: relative;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));

        width: 96%;
        height: 90%;

        padding: 2% 2%;
        gap: 15px;
        background-color: rgb(120, 120, 120);
        border-radius: 20px;
        box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
    }

    .category_display{
        position: relative;
        display: flex;
        justify-content: end;
        padding-right: 10px;
        align-items: center;
        background-color: rgb(70, 70, 70);
        background-position: top right;
        background-size: 100%;
        color: var(--main_white);
        border-radius: 10px;
        box-shadow: 3px 3px 3px rgb(40, 40, 40);
    }

    .category_display input[type="checkbox"]{
        width: 40px;
        cursor: pointer;
    }

    .category_display input[type="checkbox"]:checked{
        accent-color: white;
    }

    .category_name{
        font-family: 'Cormorant Garamond';
        font-size: x-large;
        font-weight: bold;
        margin: 5px;
        width: 60%;
    }

    .option_button {
        position: relative;
        width: 20px;
        aspect-ratio: 1;
		background-color: transparent;
		background-image: url('/assets/more_vert.png');
		background-size: contain;
        background-position: center center;
		background-repeat: no-repeat;
		border: none;
		cursor: pointer;
	}

    .option_button:hover{
		opacity: 0.7;
	}

    .close {
		cursor: pointer;
	}

    h1{
        color: var(--main_white);
		text-shadow: 3px 3px 3px rgb(10, 10, 10);
    }
</style>
