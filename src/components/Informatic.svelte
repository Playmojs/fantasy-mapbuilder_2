<script lang="ts">
	import { onMount } from 'svelte';
	import edit_mode from '../store'
	import showdown from 'showdown';

	let editable: boolean;
	$: editable = $edit_mode;

	let informaticWindow: HTMLDivElement;
	let informatic: HTMLDivElement;
	let editButton: HTMLImageElement;
	let resizer: HTMLDivElement;
	let text: string = '';


	onMount(() => {
		if (editButton) {
			editButton.addEventListener('click', toggleEditable);
		}

		if (resizer) {
			let originalX: number;
			let originalY: number;
			let originalMouseX: number;
			let originalMouseY: number;
			let windowWidth: number;
			let windowHeight: number;

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

				newX = newX < 92 ? newX : 92;

				informaticWindow.style.left = `${newX}%`;
				informaticWindow.style.width = `${100 - newX}%`;
			}

			function stopResize() {
				window.removeEventListener('mousemove', resize);
				window.removeEventListener('mouseup', stopResize);
			}
		}
	});

	function toggleEditable() {
		if (editable) {
			text = informatic.innerText;
		}
		edit_mode.update(editable => !editable);
	}


	$: update_informatic(editable);

	function update_informatic(editable: boolean) {
		if (editable) {
			informatic.innerText = text;

		} else {
			if(text){
				let converter = new showdown.Converter();
				informatic.innerHTML = converter.makeHtml(text);
		}}
	}

</script>

<div id="informaticWindow" bind:this={informaticWindow}>
	<div id="resizer" bind:this={resizer}></div>
	<div id="toolbar">
		<img
			id="edit_content_button"
			class:editable={editable}
			src="/assets/edit-icon.png"
			alt="Edit Content"
			bind:this={editButton}
		/>
	</div>
	<div id="informatic" class='{editable? 'editable' : 'non-editable'}' bind:this={informatic} contenteditable={editable}>
		{text}
	</div>
</div>

<style>
	#informaticWindow {
		position: fixed;
		background-color: rgb(47, 47, 47);
		top: 0%;
		left: 66%;
		height: 100%;
		width: 34%;
		z-index: 10;
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
		padding: 10px;
		margin-bottom: 10px;
	}

	#informatic.non-editable
	{
		background-color: rgb(47, 47, 47);
		color: white;
		margin: 0px;
		white-space: normal;
	}

	#informatic.editable
	{
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

	#edit_content_button {
		position: relative;
		background-color: #555;
		height: 100%;
		margin-right: 10px;
		margin-top: 10px;
		shape-outside: circle();
		border-radius: 7%;
	}

	#edit_content_button:hover {
		background-color: #888;
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
</style>
