<script lang="ts">
	import { store } from '../../store.svelte';
	import Editor from '../Editor.svelte';
	import dtb from '$lib/dtb';
	import { add_and_choose_article, choose_article_by_id, get_article_options, get_composite_category_modal, get_filtered_choose_category_modal, push_modal, push_promise_modal } from '$lib/modal_manager.svelte';
	import KeyWordRenderer from '../KeyWordRenderer.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Category } from '$lib/types';
	import { theme_entities } from '$lib/data.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	let {close, article_id, on_close} : {close: () => void, article_id: number, on_close?: (success: boolean) => void} = $props()
	
	let article_title: HTMLHeadElement;
	let editor = $state<Editor>();


	let article = $derived({...store.article_cache[article_id]})
	let latest_editor_content = $state<string>('')

	let text_size = $state<number>(150)

	let edit_mode = $state<boolean>(false)

	let on_display = $state<'front-page' | 'main'>('front-page')

	let current_categories = $derived<Category[]>(Object.entries(store.article_category_links).filter(([category_id, article_ids]) => {return article_ids.includes(article_id)}).map(([category_id, article_ids]) => {return store.category_cache[+category_id]}))

	// let article_stack = $derived(Array.from(new Set(store.article_history.concat(store.undone_articles).concat(store.article_modal_articles))))
	// let stack_ix = $derived(article_stack.indexOf(article_id))

	// function set_article_id_from_stack(stack_change: number){
	// 	if (stack_ix === -1){return}
	// 	const new_ix = stack_ix + stack_change
	// 	if (new_ix < 0 || new_ix >= article_stack.length){return}
	// 	const current_tab = store.article_modal_articles.indexOf(article_id)
	// 	article_id = article_stack[new_ix]
	// 	store.article_modal_articles[current_tab] = article_id
	// 	on_display = 'front-page'
	// }

	function close_article(id: number){
		store.article_modal_articles = store.article_modal_articles.filter(val => {return id !== val})
		if(store.article_modal_articles.length === 0){close()}
		else{article_id = store.article_modal_articles.at(-1) ?? 0}
	}

	onMount(()=>{
		if(!store.article_modal_articles.includes(article_id)){store.article_modal_articles.push(article_id)}
	})

	async function save_content(){
		if(edit_mode){
			await dtb.update_article({...article, content: editor?.get_content() ?? article.content, title: article_title?.innerText ?? article.title})
		}
	}

	function on_editor_change() {
		if(editor){latest_editor_content = editor.get_content()}
	}
	
	function open_article_options(){
		push_modal(get_article_options(article.id))
	}
	
	let image_source = $derived<string>((article.image && store.image_public_urls[article.image]) ? URL.createObjectURL(store.image_public_urls[article.image]) : '')

	function change_text_size(factor: number) {
		text_size = text_size * factor;
	}

	function set_article_id(id: number) {
		if(edit_mode){
			save_content()
		}
		article_id = id
	}

	async function add_tab(){
		await dtb.fetch_all_from_project(store.project_id)
		let value: {id: number | null, title: string} = {id: null, title: ''}
		await push_promise_modal({type: 'choose_modal', data: {Articles: [add_and_choose_article(value)].concat(choose_article_by_id(value))}, use_search: true})
		if (value.id === null){return}
		if(!store.article_modal_articles.includes(value.id)){
			store.article_modal_articles.push(value.id)
		}
		article_id = value.id
	}

</script>

<div
	id="article_modal"
	class:edit_mode={store.edit_mode}
>
	<div id='button_bar'>
		<div id="articles_tab">
			{#each store.article_modal_articles as id}
				<button class='tab_button' class:disabled={article_id === id} onclick={()=>{set_article_id(id)}}>
					<p class='tab_text'>{store.article_cache[id]?.title ?? "Unknown"}</p>
					<span class="close" onclick={(e: Event) => {close_article(id); e.stopPropagation()}}>&times;</span>
				</button>
			{/each}
			<button id='add_tab_button' onclick={add_tab}>+
			</button>
		</div>

		{#if store.write_access}
		<button
			id="edit_article_button"
			onclick={async () => {
				if(edit_mode){await save_content()}
				edit_mode = !edit_mode;
			}}
			class:pressed={edit_mode}
			style="background-image: url('/assets/quill.png');"
			title="Toggle Edit Mode"
			aria-label='Toggle Edit Mode'
		></button>
		{/if}

		<button
			id="increment_text_size_button"
			onclick={() => {
				change_text_size(1.1);
			}}
			style="background-image: url('/assets/fantasy-plus.png');"
			title="Increase text size"
			aria-label='Increase Text Size Button'
		></button>

		<button
			id="decrement_text_size_button"
			onclick={() => {
				change_text_size(0.9);
			}}
			style="background-image: url('/assets/fantasy_minus.png');"
			title="Decrease text size"
			aria-label='Decrease Text Size Button'
			></button>

			<button 
			id="edit_image_button" 
			onclick={open_article_options}
			style="background-image: url('/assets/fantasy_cog.png');"
			class:hidden={!store.edit_mode}
			title="Increase text size"
			aria-label='Increase Text Size Button'
		></button>
	</div>

	<div id='display_window'>
	<div id='display_row'>
		<button class='display_row_button' 
				onclick={()=>{on_display='front-page'}}
				disabled={on_display==='front-page'}>Cover
		</button>
		<button class='display_row_button' onclick={()=>{on_display='main'}} disabled={on_display==='main'}>Content
		</button>
	</div>
	{#if on_display === 'front-page'}
	<div id='front-page'>	
		<div id="cover">
			<div
			id="article_title"
			contenteditable={edit_mode}
			class={edit_mode ? 'editable' : 'non-editable'}
			onblur={() => {
				save_content();
			}}
				>
				<h1 bind:this={article_title}>{article?.title ?? "Unknown"}</h1>
			</div>
			<div id="image_container" style="height: {30}%;">
				<img
				id="article_image"
				src={image_source}
				alt="Article image"
				class:hidden={article.image === null}
				/>
			</div>
		</div>
		<ul id="category_list">
			{#each current_categories as category}
			<li class="category_entity" style='background-image: url("{theme_entities[category.theme_id].image}");'>
				<p class='category_name'>{category.name}</p>
				{#if edit_mode}
					<button class='option_button' onclick={()=>{push_modal(get_composite_category_modal({...category}))}}></button>
					<span class="remove_link" onclick={()=>{dtb.delete_article_category_link(store.project_id, category.id, article_id)}}>&times;</span>
				{/if}
			</li>
			{/each}
			{#if edit_mode}
			<li class="category_entity" style='background-image: url("{theme_entities[0].image}");' onclick={async ()=>{await get_filtered_choose_category_modal(article_id, current_categories)}}>
				<p>+ Add category</p>
			</li>
			{/if}
		</ul>
	</div>
	{:else if on_display === 'main'}
		<div id='article_reader'>
			<div
				id="article_content"
				style="font-size: {text_size}%;"
			>
				<SvelteMarkdown source={editor ? latest_editor_content : article.content} renderers={{link: KeyWordRenderer as any}}/> 
			</div>
			{#if edit_mode}
			<div id="article_editor">
				<Editor bind:this={editor} on_destroy={save_content} original_content={article.content} text_size={text_size} on_change={on_editor_change}/>
			</div>
			{/if}
		</div>
	{/if}
	</div>
</div>

<style>

	/* Modal */

    #article_modal{
        display: flex;
        flex-direction: column;
    }

	/* Tab bar */

    #button_bar{
        position: relative;
		display: flex;
		gap: 10px;
		height: 50px;
		flex-shrink: 0;
	}

	#articles_tab{
		display: flex;
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
	}

	
	#display_window{
		display: flex;
		flex-direction: column;
		
		background-color: rgb(40, 40, 40);
		border-radius: 30px;
		padding-bottom: 40px;
	}
	
	#display_row {
		display: flex;
		width: 100%;
		justify-content: start;
		align-items: center;
		margin-bottom: 30px;
	}
	
	.display_row_button {
		height: 40px;
		flex: 1;
		border-radius: 5px;
		background-color: rgb(60, 60, 60);
		color: var(--main_white);
		font-size: x-large;
		box-shadow: 5px 5px 5px rgb(40, 40, 40)
	}
	
	.display_row_button:disabled{
		background-color: rgb(40, 40, 40);
		border: none;
		box-shadow: none;
	}

	/* Front page */
	
    #front-page{
		display: flex;
		gap: 20px;
		padding: 0px 20px;
	}

	#cover{
		display: flex;
		flex-direction: column;
		width: 65%;
		height: 55vh;
	}

	#category_list{
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 35%;
		gap: 10px;
		padding: 20px 0px;
		
		background-color: rgb(130, 130, 130);
		border-radius: 20px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}

	.category_entity{
		position: relative;
        display: flex;
        width: 60%;
        padding: 0 30px;
        align-items: center;
        background-color: rgb(70, 70, 70);
        background-position: top right;
        background-size: 100%;
        
		font-size: x-large;
		color: var(--main_white);
        border-radius: 10px;
        box-shadow: 3px 3px 3px rgb(40, 40, 40);
	}

	.category_name {
		flex: 1;
	}

	.remove_link {
		cursor: pointer;
	}

	.remove_link:hover{
		opacity: 0.7
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

    #article_title {
		position: relative;
        min-width: 400px;
        max-width: 800px;
        margin: 20px auto;
		
        font-size: 2rem;
        text-align: center;
        border-radius: 10px;
        font-family: 'Garamond Semibold Italic';
        color: var(--main_white);
		text-shadow: 2px 2px 2px rgb(10, 10, 10);
    }
	
	#image_container{
		flex: 1;
		
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
    #article_image {
		position: relative;
        max-width: 80%;
		max-height: 100%;
        border-radius: 10px;
    }

	/* Main content */
    
	#article_reader {
		height: 55vh;
		
		background-color: rgb(47, 47, 47);
		display: flex;
		align-items: center;
		overflow-y: hidden;
		gap: 20px;
		padding: 0px 0px;
		border-radius: 20px;
		
		box-shadow: inset 5px 0px 5px rgb(20, 20, 20);
	}
	
    #article_content {
		position: relative;
		max-height: 50vh;
        height: 90%;
		overflow-y: auto;

        flex: 1;
        font-family: 'Garamond Regular';
        text-align: justify;
        padding: 0px 10px;
        border-radius: 10px;
        color: var(--main_white);
        white-space: normal;
    }

	#article_editor{
		position: relative;
		height: 90%;
		flex: 1;
	}
	
	#button_bar button{
		position: relative;
		aspect-ratio: 4/3; 
		height: 80%;
		border: none;
		cursor: pointer;
		color: var(--main_white);

		background-size: contain;
		background-position: center center;
		background-color: rgb(60, 60, 60);
		border-radius: 10px;
		background-repeat: no-repeat;
		box-shadow: 3px 3px 5px rgb(30, 30, 30);
	}
	
	#button_bar button:active{
		box-shadow: inset 3px 3px 3px rgb(50, 50, 50);
	}
	
	#edit_image_button.hidden{
		display: none;
	}
	
	#redo_article_button:disabled{
		cursor: default;
		box-shadow: none;
		filter: brightness(70%);	
	}
	
	#undo_article_button:disabled{
		cursor:default;
		box-shadow: none;
		filter: brightness(70%);
	}
	
	.tab_button{
		width: 150px;
		flex-shrink: 1;
		min-width: 100px;
		display: flex;
		justify-content: end;
		align-items: center;
		font-size: large;

		background-color: rgb(60, 60, 60);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		border: none;
	}

	.tab_text{
		position: relative;
		flex: 1;

		text-align: left;
		margin-left: 10px;

		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	
	#edit_article_button.pressed{
		background-color: rgb(40, 40, 40);
	}

	.close{
		position: relative;
		flex: 0 0 20px;
		cursor: pointer;
	}

	.close:hover{
		opacity: 0.7;
	}

	#articles_tab > button.disabled{
		background-color: rgb(40, 40, 40);
		cursor: default;
		box-shadow: none;
	}
	
	#article_title h1 {
		margin: 0;
		padding: 0;
	}

	#article_title.editable{
		color: black;
		background-color: rgba(220, 220, 220, 0.8);
	}


	h1 {
		margin: 5px;
	}

	#article_content.editable {
		background-color: white;
		color: black;
		white-space: pre-wrap;
		padding: 10px 0px 0px 5px;
	}

	#article_content::-webkit-scrollbar{
		width: 12px;
	}

	#article_content::-webkit-scrollbar-thumb {
		background-color: #555;
		border-radius: 5px;
	}

	#article_content::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#article_content::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	#articles_tab::-webkit-scrollbar{
		width: 5px;
	}

	#articles_tab::-webkit-scrollbar-thumb {
		background-color: #555;
		border-radius: 5px;
	}

	#articles_tab::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#articles_tab::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	#article_image.hidden {
		display: none;
	}
</style>
