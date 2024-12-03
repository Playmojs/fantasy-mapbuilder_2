<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../../store.svelte';
	import Editor from '../Editor.svelte';
	import dtb from '$lib/dtb';
	import { choose_article_by_id, get_article_options, push_modal, push_promise_modal } from '$lib/modal_manager.svelte';
	import KeyWordRenderer from '../KeyWordRenderer.svelte';
	import { pop_article, undo_article_pop} from '$lib/article_stack';
	import type { Article } from '$lib/types';
	import { onMount } from 'svelte';

	let article_title: HTMLHeadElement;

    let {close, article_id, on_close} : {close: () => void, article_id: number, on_close?: (success: boolean) => void} = $props()

	let article = $derived({...store.article_cache[article_id]})
	let text_size = $state<number>(150)

	let on_display = $state<'front-page' | 'main'>('front-page')

	let article_stack = $derived(store.article_history.concat(store.undone_articles))
	let stack_ix = $derived(article_stack.indexOf(article_id))

	function set_article_id_from_stack(stack_change: number){
		if (stack_ix === -1){return}
		const new_ix = stack_ix + stack_change
		if (new_ix < 0 || new_ix >= article_stack.length){return}
		const current_tab = store.article_modal_articles.indexOf(article_id)
		article_id = article_stack[new_ix]
		store.article_modal_articles[current_tab] = article_id
		on_display = 'front-page'
	}

	function close_article(id: number){
		store.article_modal_articles = store.article_modal_articles.filter(val => {return id !== val})
		if(store.article_modal_articles.length === 0){close()}
		else{article_id = store.article_modal_articles.at(-1) ?? 0}
	}

	onMount(()=>{
		if(!store.article_modal_articles.includes(article_id)){store.article_modal_articles.push(article_id)}
	})

	function updateTitle() {
		const title: string = article_title.innerText;

		article.title = title;
        dtb.update_article(article)
	}
	
	function open_article_options(){
		push_modal(get_article_options(article.id))
	}
	
	let image_source = $state('');
	$effect(() => {
		if (article.image && store.image_public_urls[article.image]) {
			image_source = URL.createObjectURL(store.image_public_urls[article.image]);
		}
	});

	function change_text_size(factor: number) {
		text_size = text_size * factor;
	}

	async function add_tab(){
		let value: {id: number | null, title: string} = {id: null, title: ''}
		await push_promise_modal({type: 'choose_modal', data: {Articles: choose_article_by_id(value)}, use_search: true})
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

		<button
			id="undo_article_button"
			onclick={() => {
				set_article_id_from_stack(-1);
			}}
			style="background-image: url('/assets/arrow_left.png');"
			title="Go to last Article"
			aria-label='Undo Button'
			disabled={stack_ix === -1 || stack_ix === 0}
		></button>	
		
		<button
			id="redo_article_button"
			onclick={() => {
				set_article_id_from_stack(1);
			}}
			disabled={stack_ix === -1 || stack_ix === article_stack.length - 1}
			style="background-image: url('/assets/arrow_right.png');"
			title="Go to next Article"
			aria-label='Redo Button'
		></button>

		<div id="articles_tab">
			{#each store.article_modal_articles as id}
				<button class='tab_button' class:disabled={article_id === id} onclick={()=>{article_id = id}}>
					<p class='tab_text'>{store.article_cache[id].title}</p>
					<span class="close" onclick={(e: Event) => {close_article(id); e.stopPropagation()}}>&times;</span>
				</button>
			{/each}
			<button id='add_tab_button' onclick={add_tab}>+
			</button>
		</div>

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
		<div
		id="article_title"
		contenteditable={store.edit_mode}
		class={store.edit_mode ? 'editable' : 'non-editable'}
		onblur={() => {
			updateTitle();
		}}
			>
			<h1 bind:this={article_title}>{article.title}</h1>
		</div>
		<div id="image_container" style="height: {article.image !== null ? 30 : store.edit_mode ? 10 : 0}%;">
			<img
			id="article_image"
			src={image_source}
			alt="Article image"
			class:hidden={article.image === null}
			/>
		</div>
	{:else if on_display === 'main'}
		<div id='article_reader'>
			<div
				id="article_content"
				class={store.edit_mode ? 'editable' : 'non-editable'}
				style="font-size: {text_size}%;"
			>
				{#if store.edit_mode}
					<Editor />
				{:else}
					<SvelteMarkdown source={article.content} renderers={{link: KeyWordRenderer}}/>
				{/if}
			</div>
		</div>
	{/if}
	</div>
</div>

<style>
    #article_modal{
        display: flex;
        flex-direction: column;
    }

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
	
    
    #article_title {
		position: relative;
        height: 20%;
        min-width: 400px;
        max-width: 800px;
        margin: 20px auto;
		
        font-size: 3rem;
        text-align: center;
        border-radius: 10px;
        font-family: 'Garamond Semibold Italic';
        color: var(--main_white);
		text-shadow: 2px 2px 2px rgb(10, 10, 10);
    }
	
	#image_container{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
    #article_image {
		position: relative;
        width: 60%;
        border-radius: 10px;
    }
    
	#article_reader {
		max-height: 55vh;
		
		background-color: rgb(47, 47, 47);
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		gap: 20px;
		padding: 30px 0px;
		border-radius: 20px;
		
		box-shadow: inset 5px 0px 5px rgb(20, 20, 20);
	}
	
    #article_content {
		position: relative;
        height: 90%;
        width: 90%;
        font-family: 'Garamond Regular';
        text-align: justify;
        padding: 0px 10px;
        border-radius: 10px;
        color: var(--main_white);
        white-space: normal;
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

	#article_reader::-webkit-scrollbar{
		width: 12px;
	}

	#article_reader::-webkit-scrollbar-thumb {
		background-color: #555;
		border-radius: 5px;
	}

	#article_reader::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#article_reader::-webkit-scrollbar-thumb:hover {
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
