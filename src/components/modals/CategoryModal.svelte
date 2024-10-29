<script lang="ts">
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
                const response = await dtb.create_category(store.project_id, title);
                if(response===undefined){return}
                else{value.id = response.id}
                console.log(value)
            },
            validation_func(file: Blob | File | null, title: string) {
                return title !== '';
            },
            link_func: null,
            button_title: 'Create Category',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: null,
            allow_no_file: null}};
    }

    const open_filtered_category_modal = async () => {
        const a_id = article_id;
        const add_category: ModalEntity = {image: null, title: 'Create New Category', on_click: async () => {
            let value: {id: number | null} = {id: null};
            await push_promise_modal(get_add_category_modal(value));
            console.log(value)
            if(value.id !== null){
                await dtb.insert_article_category_link(store.project_id, value.id, a_id)
            }
        }}
        
        const modal_entities: ModalEntity[] = [add_category].concat(Object.values(store.category_cache).filter((category) => {return !categories.includes(category)}).map((category)=>{return {image: null, title: category.name, on_click: ()=>{console.log(category.id); dtb.insert_article_category_link(store.project_id, category.id, a_id)}}}))
        push_promise_modal({type: 'choose_modal', data: {Categories: modal_entities}, use_search: true})
    }

</script>

<div id='title_row'>
    <h1>Categories</h1>
    <button id='add_article_category_link' onclick={open_filtered_category_modal}>Add Category</button>
</div>
<div id="category_grid">
	{#each categories as category}
        <div class="category_display">
            <p class="category_name">{category.name}</p>
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
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: rgb(70, 70, 70);
        color: var(--main_white);
        border-radius: 10px;
        box-shadow: 3px 3px 3px rgb(40, 40, 40);
    }

    .category_name{
        font-family: 'Cormorant Garamond';
        font-size: x-large;
        font-weight: bold;
        margin: 5px;
    }

    .close {
		cursor: pointer;
	}

    h1{
        color: var(--main_white);
		text-shadow: 3px 3px 3px rgb(10, 10, 10);
    }
</style>
