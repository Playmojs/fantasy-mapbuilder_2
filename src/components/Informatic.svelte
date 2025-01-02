<script module lang='ts'>
	let editor = $state<Editor>();
	export const get_updated_content: () => {id: number, content: string} = () => {
		if(store.edit_mode && editor){return {id: store.article.id, content: editor.get_content()}}
		else{return {id: store.article.id, content: store.article.content}}
	}
</script>

<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../store.svelte';
	import Editor from './Editor.svelte';
	import { fly } from 'svelte/transition';
	import dtb from '$lib/dtb';
	import {get_article_options, push_modal } from '$lib/modal_manager.svelte';
	import KeyWordRenderer from './KeyWordRenderer.svelte';
	import { pop_article, undo_article_pop} from '$lib/article_stack';
	import { theme_entities } from '$lib/data.svelte';

	let informaticWindow: HTMLDivElement;
	let article_title: HTMLHeadElement;

	let originalX: number;
	let originalMouseX: number;
	let windowWidth: number;

	let original_article_content = $derived<string>(store.article.content)

	function updateTitle() {
		const title: string = article_title.innerText;
		if (store.article) {
			store.article.title = title;
		}
	}
	const resizerOnMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		windowWidth = window.innerWidth / 100;
		originalX = informaticWindow.getBoundingClientRect().left / windowWidth;
		originalMouseX = e.pageX;
		window.addEventListener('mousemove', resizeMouse);
		window.addEventListener('mouseup', stopResize);
	};

	const resizerOnTouchDown = (e: TouchEvent) => {
		e.preventDefault();
		windowWidth = window.screen.availWidth / 100;
		originalX = informaticWindow.getBoundingClientRect().left / windowWidth;
		originalMouseX = e.touches[0].pageX;
		window.addEventListener('touchmove', resizeTouch);
		window.addEventListener('touchend', stopResize);
	};

	function resizeMouse(e: MouseEvent) {
		resize(e.pageX);
	}

	function resizeTouch(e: TouchEvent) {
		e.stopPropagation;
		if (e.touches.length !== 1) {
			return;
		}
		resize(e.touches[0].pageX);
	}

	function resize(page_x: number) {
		let newX = originalX + (page_x - originalMouseX) / windowWidth;

		newX = newX < 92 ? (newX < 0 ? 0 : newX) : 92;

		store.informatic_width = newX;

		informaticWindow.style.left = `${newX}%`;
	}

	function stopResize() {
		window.removeEventListener('mousemove', resizeMouse);
		window.removeEventListener('mouseup', stopResize);
		window.removeEventListener('touchmove', resizeTouch);
		window.removeEventListener('touchend', stopResize);
	}
	
	function open_article_options(){
		push_modal(get_article_options(store.article.id))
	}
	
	function editor_on_destroy(){
		if(!editor){return}
		dtb.update_article({...store.article, content: editor.get_content()})
	}

	let image_source = $derived<string>((store.article.image && store.image_public_urls[store.article.image]) ? URL.createObjectURL(store.image_public_urls[store.article.image]) : '')

	function change_text_size(factor: number) {
		store.text_size = store.text_size * factor;
	}
</script>


<div
	id="informaticWindow"
	bind:this={informaticWindow}
	class:edit_mode={store.edit_mode}
	transition:fly={{ x: 400, duration: 500 }}
	style='background-image: url("{theme_entities[store.category_cache[store.article.main_category ?? 0]?.theme_id ?? 0].image}");'
>
	<div id="resizer" onmousedown={resizerOnMouseDown} ontouchstart={resizerOnTouchDown}></div>

	<div id='button_bar'>

		<button
			id="undo_article_button"
			onclick={() => {
				pop_article();
			}}
			style="background-image: url('/assets/arrow_left.png');"
			title="Go to last Article"
			aria-label='Undo Button'
			disabled={store.article_history.length <= 1}
		></button>	
		
		<button
			id="redo_article_button"
			onclick={() => {
				undo_article_pop();
			}}
			disabled={store.undone_articles.length === 0}
			style="background-image: url('/assets/arrow_right.png');"
			title="Go to next Article"
			aria-label='Redo Button'
		></button>

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
			id="open_article_modal_button"
			onclick={()=>{push_modal({type:'article_modal', data: store.article.id})}}
			style="background-image: url('/assets/Parchment.png');"
			title="View Article in Article Viewer"
			aria-label="View Article in Article Viewer"
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
	<div
		id="article_title"
		contenteditable={store.edit_mode}
		class={store.edit_mode ? 'editable' : 'non-editable'}
		onblur={() => {
			updateTitle();
		}}
	>
		<h1 bind:this={article_title}>{store.article.title}</h1>
	</div>
	<div id="image_container" style="height: {store.article.image !== null ? 30 : 0}%;">
		<img
		id="article_image"
		src={image_source}
		alt="Article image"
		class:hidden={store.article.image === null}
		/>
	</div>
	<div
		id="informatic"
		class={store.edit_mode ? 'editable' : 'non-editable'}
		style="font-size: {store.text_size}%;"
	>
		{#if store.edit_mode}
			<Editor bind:this={editor} original_content={store.article.content} text_size={store.text_size} on_destroy={editor_on_destroy}/>
		{:else}
			<SvelteMarkdown source={original_article_content} renderers={{link: KeyWordRenderer}}/>
		{/if}
	</div>
</div>

<style>
	#informaticWindow {
		touch-action: none;
		position: absolute;
		background-color: rgb(47, 47, 47);
		top: 50px; /* TODO: Define once */
		bottom: 0;
		left: 66%;
		right: 0%;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 1%;
		padding: 10px;

		background-position: top right;
		background-size: 500px;
		box-shadow: inset 5px 0px 5px rgb(20, 20, 20);
	}

	#button_bar{
		display: flex;
		gap: 20px;
		height: 50px;
		flex-shrink: 0;
	}

	#button_bar button{
		position: relative;
		aspect-ratio: 4/3; 
		height: 80%;
		border: none;
		cursor: pointer;
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

	#article_title {
		position: relative;
		height: 7%;
		min-width: 400px;
		max-width: 800px;
		margin: 0 auto;

		
		font-size: 150%;
		text-align: center;
		border-radius: 10px;
		font-family: 'Garamond Semibold Italic';
		white-space: nowrap;
		background-color: rgba(50, 50, 50, 0.8);
		color: var(--main_white);
	}

	#article_title h1 {
		margin: 0;
		padding: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	#article_title.editable{
		color: black;
		background-color: rgba(220, 220, 220, 0.8);
	}


	h1 {
		margin: 5px;
	}

	@media (max-width: 1080px) {
		#article_title {
			height: 15%;
		}
	}

	#informatic {
		touch-action: pan-y;
		position: relative;
		height: 90%;
		left: 0;
		right: 0;
		background-color: inherit;
		font-family: 'Garamond Regular';
		text-align: justify;
		overflow-y: scroll;
		padding: 0px 10px;
		border-radius: 10px;
		background-color: rgb(47, 47, 47);
		color: var(--main_white);
		white-space: normal;
	}	

	#informatic.editable {
		background-color: white;
		color: black;
		white-space: pre-wrap;
		padding: 10px 0px 0px 5px;
	}

	#informatic::-webkit-scrollbar-track.editable {
		background: white;
	}

	#informatic::-webkit-scrollbar {
		width: 12px;
	}

	#informatic::-webkit-scrollbar-track.non-editable {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#informatic::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#informatic::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#informatic::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	#resizer {
		position: absolute;
		top: 0;
		left: 0;
		cursor: e-resize;
		width: 10px;
		height: 100%;
		background-color: transparent;
		z-index: 10;
	}

	@media (max-width: 768px) {
		#resizer {
			width: 25px;
		}
	}

	#image_container{
		display: flex;
	}

	#article_image {
		position: relative;
		display: block;	
		height: 100%;
		margin-left: auto;
		margin-right: auto;
		border-radius: 10px;
	}

	#article_image.hidden {
		display: none;
	}

	/* Fonts */

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Regular.ttf');
		font-weight: normal;
		font-style: normal;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Bold.ttf');
		font-weight: bold;
		font-style: normal;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Italic.ttf');
		font-weight: normal;
		font-style: italic;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-SemiBoldItalic.ttf');
		font-weight: 600;
		font-style: italic;
	}

	:global(p) {
		font-family: 'Cormorant Garamond', serif;
	}

	:global(strong) {
		font-family: 'Cormorant Garamond';
		font-weight: bold;
	}

	:global(em) {
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
	}

	h1 {
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
	}
</style>
