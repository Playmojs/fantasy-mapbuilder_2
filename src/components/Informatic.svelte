<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../store.svelte';
	import Editor from './Editor.svelte';

	let informaticWindow: HTMLDivElement;
	let { text } = $props<{ text: string }>();

	let minimized: boolean = false;

	let originalX: number;
	let originalMouseX: number;
	let windowWidth: number;
	const resizerOnMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		windowWidth = window.innerWidth / 100;
		originalX = informaticWindow.getBoundingClientRect().left / windowWidth;
		originalMouseX = e.pageX;
		window.addEventListener('mousemove', resize);
		window.addEventListener('mouseup', stopResize);
	};

	function resize(e: MouseEvent) {
		let newX = originalX + (e.pageX - originalMouseX) / windowWidth;

		newX = newX < 92 ? (newX < 0 ? 0 : newX) : 92;

		informaticWindow.style.left = `${newX}%`;
		informaticWindow.style.width = `${100 - newX}%`;
	}

	function stopResize() {
		window.removeEventListener('mousemove', resize);
		window.removeEventListener('mouseup', stopResize);
	}

	function toggleMinimize() {
		minimized = !minimized;
	}

	function toggleEditable() {
		store.edit_mode = !store.edit_mode;
	}
</script>

<div
	id="informaticWindow"
	bind:this={informaticWindow}
	class:edit_mode={store.edit_mode}
	class:minimized
>
	<div id="resizer" on:mousedown={resizerOnMouseDown}></div>
	<div id="toolbar">
		<button id="minimize_button" on:click={toggleMinimize} />

		<button id="edit_content_button" class:edit_mode={store.edit_mode} on:click={toggleEditable} />
	</div>
	<div id="informatic" class={store.edit_mode ? 'editable' : 'non-editable'}>
		{#if store.edit_mode}
			<Editor />
		{:else}
			<SvelteMarkdown source={text} />
		{/if}
	</div>
</div>

<button id="maximize_button" on:click={toggleMinimize} />

<style>
	#informaticWindow {
		position: absolute;
		background-color: rgb(47, 47, 47);
		top: 0%;
		left: 66%;
		height: 100%;
		width: 34%;
		z-index: 10;
	}

	#informaticWindow.minimized {
		display: none;
	}

	#informatic {
		position: relative;
		top: 30%;
		height: 60%;
		left: 0;
		right: 0;
		background-color: inherit;
		font-size: large;
		text-align: justify;
		overflow-y: scroll;
		margin-bottom: 10px;
	}

	#informatic.non-editable {
		background-color: rgb(47, 47, 47);
		color: white;
		margin: 0px;
		white-space: normal;
	}

	#informatic.editable {
		background-color: white;
		color: black;
		margin: 20px;
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

	#toolbar {
		position: relative;
		height: 5%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	#toolbar button {
		position: relative;
		background-color: #555;
		height: 100%;
		aspect-ratio: 1.5;
		margin-right: 20px;
		margin-top: 20px;
		shape-outside: circle();
		border-radius: 15%;
		background-size: contain;
		border-color: transparent;
	}

	#toolbar button:hover {
		background-color: #888;
	}

	#edit_content_button {
		background: url('/assets/edit-icon.png') no-repeat center center;
	}

	#minimize_button {
		background: url('/assets/minus.png') no-repeat center center;
	}

	#edit_content_button.editable {
		background-color: #111;
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

	#maximize_button {
		position: absolute;
		height: 5%;
		aspect-ratio: 1.5;
		top: 0%;
		left: 94%;
		margin-right: 2%;
		margin-top: 2%;
		shape-outside: circle();
		border-radius: 15%;
		background: url('/assets/plus.png') no-repeat center center;
		background-size: contain;
		background-color: #555;
		border-color: transparent;
	}

	#maximize_button:hover {
		background-color: #888;
	}

	#maximize_button.hidden {
		display: none;
	}
</style>
