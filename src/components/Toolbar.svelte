<script lang="ts">
	import { add_article, add_map } from '$lib/types';
	import { store } from '../store.svelte';
	import { get } from 'svelte/store';
	import dtb from '$lib/dtb';

	function addMarker(event: MouseEvent) {
		if (store.map === undefined) {
			return;
		}
		const id = new Uint32Array(1);
		crypto.getRandomValues(id);
		store.map.marker_ids.push(id[0]);
	}

	function deleteMarker() {
		if (store.selected_marker === null || store.map === undefined) {
			return;
		}
		store.map.marker_ids = store.map.marker_ids.filter((id: number) => {
			return id !== store.selected_marker;
		});

		store.selected_marker = null;
	}

	function toggleMinimize() {
		store.minimized = !store.minimized;
	}

	async function toggleEditable() {
		store.selected_marker = null;
		store.edit_mode = !store.edit_mode;
		if (store.edit_mode) {
			await dtb.fetch_all();
		}
	}

	function change_text_size(factor: number) {
		store.text_size = store.text_size * factor;
	}

	function changeMarkerTarget() {
		if (store.selected_marker === null) {
			return;
		}
		switch (store.markers[store.selected_marker].type) {
			case 'Informatic':
				store.modal_data = {
					entities: [add_article].concat()
				};
				break;
			case 'Map':
				store.modal_data = {
					entities: [add_map].concat()
				};
		}
	}
</script>

<div id="toolbar">
	<button
		onclick={() => deleteMarker()}
		class:hidden={!store.edit_mode || store.selected_marker === null}
		style="background-image: url('/assets/delete_marker.png');"
	></button>
	<button
		onclick={() => {
			changeMarkerTarget();
		}}
		style="background-image: url('/assets/change_marker.png');"
		class:hidden={!store.edit_mode || store.selected_marker === null}
	></button>
	<button
		onclick={(event: MouseEvent) => addMarker(event)}
		class:hidden={!store.edit_mode}
		style="background-image: url('/assets/add_marker.png');"
	></button>

	<button id="edit_content_button" class:edit_mode={store.edit_mode} onclick={toggleEditable}
	></button>
	<button
		id="increment_text_size_button"
		onclick={() => {
			change_text_size(1.1);
		}}
		style="background-image: url('/assets/plus.png');"
		class:hidden={store.minimized}
	></button>

	<button
		id="decrement_text_size_button"
		onclick={() => {
			change_text_size(0.9);
		}}
		style="background-image: url('/assets/minus.png');"
		class:hidden={store.minimized}
	></button>
	<button
		id="minimize_button"
		onclick={toggleMinimize}
		style="background-image: url('/assets/{store.minimized
			? 'double_arrow_left'
			: 'double_arrow_right'}.png');"
	></button>
</div>

<style>
	#toolbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 50px; /* TODO: Define once */
		background-color: #4b4343;
		color: white;
		display: flex;
		justify-content: flex-end; /* Ensures buttons are at the right end */
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 11;
	}
	#toolbar button {
		aspect-ratio: 4/3; /* Adjust the size as needed */
		height: 80%; /* Adjust the size as needed */
		border: none;
		padding: 10px;
		cursor: pointer;
		background-size: contain;
		background-position: center center;
		background-color: #4b4343;
		background-repeat: no-repeat;
	}

	#toolbar button:hover {
		opacity: 0.8; /* Slight hover effect */
	}

	#edit_content_button {
		background: url('/assets/edit-icon.png');
		margin-left: 10%;
	}

	#edit_content_button.edit_mode {
		background-color: #111;
	}

	#increment_text_size_button {
		margin-left: 5%;
	}

	.hidden {
		display: none;
	}
</style>
