<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../../store.svelte';
	import { fly } from 'svelte/transition';
	import KeyWordRenderer from '../KeyWordRenderer.svelte';
	import { pop_article, undo_article_pop} from '$lib/article_stack';
	import { theme_entities } from '$lib/data.svelte';

	let informatic_window: HTMLDivElement;
	let article_title: HTMLHeadElement;

	// Dim is used as replacement for width/height, because the resizing should flexibly work in both directions.
	let initial_dim: number;
	let initial_mouse_dim: number;
	let window_dim: number;

	function updateTitle() {
		const title: string = article_title.innerText;
		if (store.article) {
			store.article.title = title;
		}
	}
	const resizerOnMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		window_dim = (window.innerHeight - 50) / 100;
		initial_dim = informatic_window.getBoundingClientRect().top / window_dim;
		initial_mouse_dim = e.pageY + 50;
	
		window.addEventListener('mousemove', resizeMouse);
		window.addEventListener('mouseup', stopResizeMouse);
	};

	const resizerOnTouchDown = (e: TouchEvent) => {
		e.preventDefault();
	
		window_dim = window.screen.availHeight / 100;
		initial_dim = informatic_window.getBoundingClientRect().top / window_dim;
		initial_mouse_dim = e.touches[0].pageY;
		
		window.addEventListener('touchmove', resizeTouch);
		window.addEventListener('touchend', stopResizeTouch);
	};

	function resizeMouse(e: MouseEvent) {
		resize(e.pageY);
	}

	function resizeTouch(e: TouchEvent) {
		e.stopPropagation();
		if (e.touches.length !== 1) {
			return;
		}
		resize(e.touches[0].pageY);
	}

	function resize(page_x: number, round: boolean = false) {
		let new_size_percentage = 100 - (initial_dim + (page_x - initial_mouse_dim) / window_dim);
		let lower_size_limit = 30 /window_dim;
		if(round){
			new_size_percentage = new_size_percentage < 35 ? lower_size_limit : new_size_percentage < 65 ? 50 : 100;
		}
		store.informatic_dim = new_size_percentage;
	}

	function stopResizeTouch(e: TouchEvent) {
		e.stopPropagation();
		if(e.touches.length === 1){
			resize(e.touches[0].pageY)
		}
		window.removeEventListener('touchmove', resizeTouch);
		window.removeEventListener('touchend', stopResizeTouch);
	}

	function stopResizeMouse(e: MouseEvent) {
		resize(e.pageY, true)
		window.removeEventListener('mousemove', resizeMouse);
		window.removeEventListener('mouseup', stopResizeMouse);
	}

	let image_source = $state('');
	$effect(() => {
		if (store.article.image && store.image_public_urls[store.article.image]) {
			image_source = URL.createObjectURL(store.image_public_urls[store.article.image]);
		}
	});

	function change_text_size(factor: number) {
		store.text_size = store.text_size * factor;
	}
</script>

<div
	id="informatic_window"
	bind:this={informatic_window}
	style='background-image: url("{theme_entities[store.category_cache[store.article.main_category ?? 0]?.theme_id ?? 0].image}"); height: {store.informatic_dim}%;'>
	
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
			</div>
		<div id="informatic_content">
		<div
			id="article_title"
			onblur={() => {
				updateTitle();
			}}
		>
			<h1 bind:this={article_title}>{store.article.title}</h1>
		</div>
		<img
			id="article_image"
				src={image_source}
				alt="Article image"
			class:hidden={store.article.image === null}
			style="height: {store.article.image !== null ? 200 : 0}px;"
		/>
		<article
			id="article_content"
			style="font-size: {store.text_size}%;"
		>
			<SvelteMarkdown source={store.article.content} renderers={{link: KeyWordRenderer}}/>
		</article>
	</div>
</div>

<style>
	#informatic_window {
		touch-action: none;
		background-color: rgb(47, 47, 47);
		
		z-index: 10;
		display: flex;
		flex-direction: column;
		box-shadow: inset 0px 5px 5px rgb(20, 20, 20);
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		
		background-position: top right;
		background-size: 500px;
	}
	
	#resizer {
		position: relative;
		cursor: n-resize;
		flex: 0 0 30px;
		background-color: transparent;
		z-index: 10;
	}
	
	#informatic_content{
		flex-grow: 1;
		
		height: calc(100% - 20px);
		display: flex;
		flex-direction: column;
		gap: 1%;
		margin: 10px;
		overflow-y: scroll;
	}

	#informatic_content::-webkit-scrollbar{
		display: none;
	}
	
	#button_bar{
		display: flex;
		gap: 20px;
		flex: 0 0 50px;
	}
	
	#article_title {
		position: relative;
		height: auto;
		margin: 0 auto;
		
		
		font-size: 150%;
		text-align: center;
		border-radius: 10px;
		font-family: 'Garamond Semibold Italic';
		white-space: nowrap;
		background-color: rgba(50, 50, 50, 0.8);
		color: var(--main_white);
	}
	
	#article_image {
		position: relative;
		margin: 0 auto;
		border-radius: 10px;
	}

	#article_content {
		touch-action: pan-y;
		
		flex: 0 0 100%;
	
		font-family: 'Garamond Regular';
		text-align: justify;
		overflow-y: scroll;

		padding: 0px 10px;
		border-radius: 10px;
		background-color: rgb(47, 47, 47);
		color: var(--main_white);
		white-space: normal;
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


	#article_title h1 {
		margin: 0;
		padding: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	h1 {
		margin: 5px;
	}

	#article_content::-webkit-scrollbar-track.editable {
		background: white;
	}

	#article_content::-webkit-scrollbar {
		width: 12px;
	}

	#article_content::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#article_content::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#article_content::-webkit-scrollbar-thumb:hover {
		background-color: #888;
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
