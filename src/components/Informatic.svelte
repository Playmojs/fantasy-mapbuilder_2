<script lang="ts">
	import { onMount } from 'svelte';

	export let text: string = '';
	export let editable: boolean = false;

	let informaticWindow: HTMLDivElement;
	let informatic: HTMLDivElement;
	let editButton: HTMLImageElement;
	let resizer: HTMLDivElement;

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
				windowHeight = window.innerHeight / 100;

				originalX = informaticWindow.getBoundingClientRect().left / windowWidth;
				originalY = informaticWindow.getBoundingClientRect().top / windowHeight;
				originalMouseX = e.pageX;
				originalMouseY = e.pageY;
				window.addEventListener('mousemove', resize);
				window.addEventListener('mouseup', stopResize);
			});

			function resize(e: MouseEvent) {
				let newX = originalX + (e.pageX - originalMouseX) / windowWidth;
				let newY = originalY + (e.pageY - originalMouseY) / windowHeight;

				newY = newY > 1 ? newY : 0;
				newX = newX < 92 ? newX : 92;

				informaticWindow.style.left = `${newX}%`;
				informaticWindow.style.top = `${newY}%`;
				informaticWindow.style.width = `${100 - newX}%`;
				informaticWindow.style.height = `${100 - newY}%`;
			}

			function stopResize() {
				window.removeEventListener('mousemove', resize);
				window.removeEventListener('mouseup', stopResize);
			}
		}
	});

	function toggleEditable() {
		editable = !editable;
		drawText();
	}

	function drawText() {
		if (editable) {
			informatic.innerHTML = text;
			informatic.contentEditable = 'true';
			informaticWindow.classList.add('edit_mode');
		} else {
			informatic.innerHTML = text;
			informatic.contentEditable = 'false';
			informaticWindow.classList.remove('edit_mode');
		}
	}

	$: drawText();
</script>

<div id="informatic_window" bind:this={informaticWindow}>
	<div id="resizer" bind:this={resizer}></div>
	<div id="toolbar">
		<img
			id="edit_content_button"
			src="/assets/edit-icon.png"
			alt="Edit Content"
			bind:this={editButton}
		/>
	</div>
	<div id="informatic" bind:this={informatic}></div>
</div>

<style>
	#informatic_window {
		position: fixed;
		background-color: rgb(47, 47, 47);
		top: 25%;
		left: 66%;
		height: 75%;
		width: 34%;
		z-index: 10;
	}

	#informatic {
		position: relative;
		height: 85%;
		left: 0;
		right: 0;
		background-color: inherit;
		color: white;
		font-size: large;
		text-align: justify;
		overflow-y: scroll;
		padding: 10px;
		margin-bottom: 10px;
		white-space: normal;
	}

	.edit_mode #informatic {
		background-color: white;
		color: black;
		margin: 10px;
		white-space: pre-wrap;
	}

	.edit_mode #informatic::-webkit-scrollbar-track {
		background: white;
	}

	#informatic::-webkit-scrollbar {
		width: 12px;
	}

	#informatic::-webkit-scrollbar-track {
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
	}

	#edit_content_button {
		position: relative;
		background-color: #555;
		height: 60%;
		margin-right: 10px;
		shape-outside: circle();
		border-radius: 7%;
	}

	#edit_content_button:hover {
		background-color: #888;
	}

	.edit_mode #edit_content_button {
		background-color: #111;
	}

	#resizer {
		position: absolute;
		top: 0;
		left: 0;
		cursor: nwse-resize;
		width: 30px;
		height: 30px;
		z-index: 10;
	}
</style>
