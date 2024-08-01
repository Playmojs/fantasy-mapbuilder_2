<script lang="ts">
	import { gotoMap } from '$lib/goto_map';
	import { MarkerType, type MarkerData } from '$lib/types';
	import { store } from '../store.svelte';

	export let marker_data: MarkerData;
	export let get_relative_movement: (x: number, y: number) => { x: number; y: number };

	let marker: HTMLButtonElement;
	let in_movement: boolean = false;

	function handleClick() {
		switch (marker_data.type) {
			case MarkerType.Informatic:
				store.non_map_informatic_id === marker_data.query_id ? store.non_map_informatic_id = null : store.non_map_informatic_id = marker_data.query_id;
				break;
			case MarkerType.Map:
				gotoMap(marker_data.query_id);
				break;
		}
	}

	function toggle_movement() {
		if (!in_movement) {
			window.addEventListener('mousemove', move_marker);
			window.addEventListener('mouseup', stop_movement);
			in_movement = true;
		}
	}

	function stop_movement() {
		window.removeEventListener('mousemove', move_marker);
		window.removeEventListener('mouseup', stop_movement);
		in_movement = false;
	}

	function move_marker(e: MouseEvent) {
		let rel_pos: { x: number; y: number } = get_relative_movement(e.x, e.y);
		marker.style.left = rel_pos.x + '%';
		marker.style.top = rel_pos.y + '%';
	}
</script>

<button
	class="marker"
	bind:this={marker}
	style="top: {marker_data.position.y}%; left: {marker_data.position.x}%"
	on:mousedown={store.edit_mode ? toggle_movement : handleClick}
	class:edit_mode={store.edit_mode}
>
	<img
		class="marker-image"
		src={marker_data.image}
		alt="Marker"
		class:hidden={marker_data.image === null}
	/>
</button>

<style>
	.marker {
		position: absolute;
		width: 3%;
		height: 3%;
		background-color: transparent;
		border: none;
		outline: none;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		cursor: pointer;
		transform: translate(-50%, -50%);
	}
	.marker:hover {
		box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.4);
	}

	.marker.edit_mode {
		box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.8);
	}

	.marker-image {
		position: relative;
		bottom: 100%;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
		width: 200%;
		height: auto;
		background-origin: initial;
	}
	.marker-image.hidden {
		display: none;
	}
</style>
