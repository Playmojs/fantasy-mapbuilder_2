<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../store.svelte';
	import Editor from './Editor.svelte';
	import { fly } from 'svelte/transition';
	import dtb from '$lib/dtb';
	import edit_mode from '../store';

	let informaticWindow: HTMLDivElement;
	let article_title: HTMLHeadElement;

	let originalX: number;
	let originalMouseX: number;
	let windowWidth: number;

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
		windowWidth = window.innerWidth / 100;
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

	async function change_article_image(){
		store.push_modal({type: 'upload_modal', data:{
			submit_func: async(file: File | null, title: string) => {
				if (file === null){
					store.article.image = null;
				}
				else{
					let image_id = await dtb.upload_image(file, 'articles')
					if(!image_id){
						console.error("Image upload failed");
						return;
					}
					store.image_public_urls[image_id] = file;
					store.article.image = image_id;
				}	
				await dtb.update_article(store.article);
				return;
			},
			validation_func(file, title) {
				return (file instanceof File || (file === null && store.article.image !== null))
			},
			link_func: null,
			button_title: "Update Article Image",
			initial_map_title: null,
			initial_image_blob: store.article.image !== null ? store.image_public_urls[store.article.image] ?? null : null,
			initial_link: null,
			allow_no_file: true,
		}
	})}

	let image_source = $state('');
	$effect(() => {
		if (store.article.image && store.image_public_urls[store.article.image]) {
			image_source = URL.createObjectURL(store.image_public_urls[store.article.image]);
		}
	});

</script>

<div
	id="informaticWindow"
	bind:this={informaticWindow}
	class:edit_mode={store.edit_mode}
	transition:fly={{ x: 400, duration: 500 }}
>
	<div id="resizer" onmousedown={resizerOnMouseDown} ontouchstart={resizerOnTouchDown}></div>

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
	<div id="image_container" style="height: {store.article.image !== null ? 30 : store.edit_mode ? 10 : 0}%;">
		{#if store.edit_mode}
			<button id="edit_image_button" onclick={change_article_image}></button>
		{/if}
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
			<Editor />
		{:else}
			<SvelteMarkdown source={store.article.content} />
		{/if}
	</div>
</div>

<style>
	#informaticWindow {
		position: absolute;
		background-color: rgb(47, 47, 47);
		top: 50px; /* TODO: Define once */
		bottom: 0;
		left: 66%;
		right: 0%;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}

	#article_title {
		position: relative;
		height: 7%;
		left: 0;
		font-size: 150%;
		text-align: center;
		border-radius: 10px;
		font-family: 'Garamond Semibold Italic';
		white-space: nowrap;
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

	@media (max-width: 1080px) {
		#article_title {
			height: 15%;
		}
	}

	#informatic {
		position: relative;
		height: 90%;
		left: 0;
		right: 0;
		background-color: inherit;
		font-family: 'Garamond Regular';
		text-align: justify;
		overflow-y: scroll;
		border-radius: 10px;
		padding-right: 10px;
	}

	.non-editable {
		background-color: rgb(47, 47, 47);
		color: white;
		white-space: normal;
	}

	.editable {
		background-color: white;
		color: black;
		white-space: pre-wrap;
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
		z-index: 10;
	}

	#image_container{
		display: flex;
		flex-shrink: 0;
	}

	#edit_image_button{
		position: relative;
		background-image: url('/assets/cog.png');
		background-color: transparent;
		background-size: contain;
		background-repeat: no-repeat;
		border: none;
		width: 30px;
		aspect-ratio: 1;
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
