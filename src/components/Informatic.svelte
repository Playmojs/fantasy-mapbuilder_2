<script lang="ts">
	import { onMount } from 'svelte';
	import edit_mode, { set_informatic } from '../store';
	import showdown from 'showdown';

	let editable: boolean;
	$: editable = $edit_mode;

	let informaticWindow: HTMLDivElement;
	let informatic: HTMLDivElement;
	let editButton: HTMLButtonElement;
	let minimizeButton: HTMLButtonElement;
	let maximizeButton: HTMLButtonElement;
	let image: HTMLImageElement;
	let resizer: HTMLDivElement;
	let text: string = '';

	let article_image_: string | null;
	$: article_image_;

	let minimized: boolean = false;

	onMount(() => {
		// if (editButton) {
		// 	editButton.addEventListener('click', toggleEditable);
		// }
		if (minimizeButton) {
			minimizeButton.addEventListener('click', toggleMinimize);
		}
		if (maximizeButton) {
			maximizeButton.addEventListener('click', toggleMinimize);
		}

		if (resizer) {
			let originalX: number;
			let originalMouseX: number;
			let windowWidth: number;

			resizer.addEventListener('mousedown', (e) => {
				e.preventDefault();
				windowWidth = window.innerWidth / 100;

				originalX = informaticWindow.getBoundingClientRect().left / windowWidth;
				originalMouseX = e.pageX;
				window.addEventListener('mousemove', resize);
				window.addEventListener('mouseup', stopResize);
			});

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
		}
	});

	const set_informatic_text = (new_text: string, article_image: string | null) => {
		if (!editable) {
			text = new_text;
			update_informatic(editable);
			article_image_ = article_image;
		}
	};
	set_informatic.set(set_informatic_text);

	function toggleMinimize() {
		minimized = !minimized;
	}

	function toggleEditable() {
		if (editable) {
			text = informatic.innerText;
		}
		edit_mode.update((edit_mode) => !edit_mode);

		update_informatic(!editable);
	}

	function update_informatic(editable: boolean) {
		if (editable) {
			informatic.innerText = text;
		} else {
			if (informatic) {
				let converter = new showdown.Converter();
				informatic.innerHTML = converter.makeHtml(text);
			}
		}
	}
</script>

<div id="informaticWindow" bind:this={informaticWindow} class:edit_mode={editable} class:minimized>
	<div id="resizer" bind:this={resizer}></div>
	<div id="toolbar">
		<button id="minimize_button" bind:this={minimizeButton} on:click={toggleMinimize} />

		<button
			id="edit_content_button"
			class:editable
			bind:this={editButton}
			on:click={toggleEditable}
		/>
	</div>
	<img id="article_image" src={article_image_} alt="Article image" class:hidden={article_image_===null}>
	<div
		id="informatic"
		class={editable ? 'editable' : 'non-editable'}
		bind:this={informatic}
		contenteditable={editable}
	>
		{text}
	</div>
</div>

<button
	id="maximize_button"
	bind:this={maximizeButton}
	class:hidden={!minimized}
	on:click={toggleMinimize}
/>

<style>
	#informaticWindow {
		position: absolute;
		background-color: rgb(47, 47, 47);
		top: 0%;
		left: 66%;
		height: 100%;
		width: 34%;
		z-index: 10;
		display: flex;
		flex-direction: column;
	}

	#informaticWindow.minimized {
		display: none;
	}

	#informatic {
		position: relative;
		height: inherit;
		left: 0;
		right: 0;
		background-color: inherit;
		font-size: large;
		text-align: justify;
		overflow-y: scroll;
		padding: 10px;
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
		height: 10%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	#toolbar button {
		position: relative;
		background-color: #555;
		height: 60%;
		aspect-ratio: 1.5;
		margin-right: 10px;
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

	#article_image
	{
		position:relative;
		height: 30%;
		display: block;
		margin-left: auto;
		margin-right: auto;
		flex-shrink: 0;
	}

	#article_image.hidden
	{
		display: none;
	}
</style>
