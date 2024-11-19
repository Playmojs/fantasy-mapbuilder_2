<script lang="ts">
	import { get_modal_entity_themes, theme_entities } from "$lib/data.svelte";
	import dtb from "$lib/dtb";
	import { edit_category_modal, get_add_category_modal, get_composite_category_modal, push_modal, push_promise_modal } from "$lib/modal_manager.svelte";
	import type { Category, CategoryModalData, ConfirmModalData, ModalEntity, UploadModal } from "$lib/types";
	import { invert_many_to_many } from "$lib/utils";
	import { store } from "../../store.svelte";
	import Modal from "./Modal.svelte";

    let { data }: {data: CategoryModalData} = $props();

    let categories = $derived<Category[]>(Object.entries(data.parent_to_children_ids).filter(([parent_id, child_ids]) => {return child_ids.includes(data.child_id)}).map(([parent_id, child_ids]) => {return store.category_cache[+parent_id]}))
    
    const open_filtered_category_modal = async () => {
        const a_id = data.child_id;
        const add_category: ModalEntity = {image: null, title: 'New Category', on_click: async () => {
            let value: {id: number | null} = {id: null};
            await push_promise_modal(get_add_category_modal(value));
            if(value.id !== null){
                await data.add_child_to_parent(value.id)
            }
        }}
        
        const modal_entities: ModalEntity[] = [add_category].concat(Object.values(store.category_cache)
            .filter((category) => {return !categories.includes(category)})
            .map((category)=>{return {image: null, title: category.name, background_image: theme_entities[category.theme_id].image, on_click: async () => {await data.add_child_to_parent(category.id)}, optional_func: ()=>{push_modal(get_composite_category_modal({...category}))}}}))
        push_promise_modal({type: 'choose_modal', data: {Categories: modal_entities}, use_search: true})
    }

    $inspect(data.parent_to_children_ids)
    $effect(()=>{
    store.inv_cat_test = invert_many_to_many(store.category_links)
    })
    $inspect(store.inv_cat_test)

</script>

<div id='title_row'>
    <h1>Categories</h1>
    <button id='add_article_category_link' onclick={open_filtered_category_modal}>Add Category</button>
</div>
<div id="category_grid">
	{#each categories as category}
        <div class="category_display" style='background-image: url("{theme_entities[category.theme_id].image}");'>
            {#if data.toggle_main_func !== null}
                <input class='category_checkbox' type="checkbox" checked={category.id === store.article_cache[data.child_id].main_category} onchange={()=> {if(data.toggle_main_func)data.toggle_main_func(category.id)}}/>
            {/if}
            <p class="category_name">{category.name}</p>
            <button class='option_button' onclick={(e: Event)=>{push_modal(get_composite_category_modal({...category}))}}>
            </button>	
            <span class="remove_link" onclick={()=>{data.remove_child_from_parent(category.id)}}>&times;</span>
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
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

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
        width: 30px;
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

    .remove_link {
		cursor: pointer;
        font-size: x-large;
	}

    .remove_link:hover{
		opacity: 0.7;
	}

    h1{
        color: var(--main_white);
		text-shadow: 3px 3px 3px rgb(10, 10, 10);
    }
</style>
