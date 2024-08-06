<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../store.svelte';
	import Editor from './Editor.svelte';
	import { getCurrentArticleId } from '$lib/data.svelte';

	let informaticWindow: HTMLDivElement;

	let originalX: number;
	let originalMouseX: number;
	let windowWidth: number;

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
		informaticWindow.style.width = `${100 - newX}%`;
	}

	function stopResize() {
		window.removeEventListener('mousemove', resizeMouse);
		window.removeEventListener('mouseup', stopResize);
		window.removeEventListener('touchmove', resizeTouch);
		window.removeEventListener('touchend', stopResize);
	}
</script>

<div
	id="informaticWindow"
	bind:this={informaticWindow}
	class:edit_mode={store.edit_mode}
	class:hidden={store.minimized}
>
	<div id="resizer" onmousedown={resizerOnMouseDown} ontouchstart={resizerOnTouchDown}></div>

	<img
		id="article_image"
		src={store.articles[getCurrentArticleId()].image}
		alt="Article image"
		class:hidden={store.articles[getCurrentArticleId()].image === null}
	/>

	<div id="informatic" class={store.edit_mode ? 'editable' : 'non-editable'}>
		{#if store.edit_mode}
			<Editor />
		{:else}
			<SvelteMarkdown source={store.articles[getCurrentArticleId()].text} />
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
		width: 34%;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}

	#informaticWindow.hidden {
		display: none;
	}

	#informatic {
		position: relative;
		height: 100%;
		left: 0;
		right: 0;
		background-color: inherit;
		font-size: large;
		text-align: justify;
		overflow-y: scroll;
	}

	#informatic.non-editable {
		background-color: rgb(47, 47, 47);
		color: white;
		white-space: normal;
	}

	#informatic.editable {
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

	#article_image {
		position: relative;
		height: 30%;
		display: block;
		margin-left: auto;
		margin-right: auto;
		flex-shrink: 0;
	}

	#article_image.hidden {
		display: none;
	}
</style>
