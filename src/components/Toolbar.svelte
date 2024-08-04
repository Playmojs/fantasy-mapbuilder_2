<script lang="ts">
	import { TargetType } from '$lib/types';
	import { add_map, store } from '../store.svelte';
	export let change_marker_target: any;

	function showSecondAlert() {
		alert('Second button clicked!');
	}

	function showThirdAlert() {
		alert('Third button clicked!');
	}

	function toggleMinimize() {
		store.minimized = !store.minimized;
	}

	function toggleEditable() {
		store.selected_marker = null;
		store.edit_mode = !store.edit_mode;
	}

</script>

<div id="toolbar">
	<button onclick={() => {change_marker_target(TargetType.Marker, store.selected_marker, [add_map]);}} style="background-image: url('/assets/a_town.png');" class:hidden={!store.edit_mode || store.selected_marker === null}></button>
	<button onclick={showSecondAlert} style="background-image: url('/assets/magil.png');"></button>
	<button onclick={showThirdAlert} style="background-image: url('/assets/a_town.png');"></button>

	<button
		id="minimize_button"
		onclick={toggleMinimize}
		style="background-image: url('/assets/{store.minimized ? 'plus' : 'minus'}.png');"
	></button>
	<button id="edit_content_button" class:edit_mode={store.edit_mode} onclick={toggleEditable}
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
		padding: 0;
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
	}

	#edit_content_button.edit_mode {
		background-color: #111;
	}

	#minimize_button {
		margin-left: 50%;
	}

	.hidden{
		display: none;
	}
</style>
