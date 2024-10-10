<script lang="ts">
	import { gotoMap } from '$lib/goto_map';
	import { type MarkerData } from '$lib/types';
	import { get, writable } from 'svelte/store';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import MarkerWindow from './MarkerWindow.svelte';
	import { assert } from '$lib/utils';

	export let marker_data: MarkerData;
	export let get_relative_movement: (x: number, y: number) => { x: number; y: number };

	let marker: HTMLButtonElement;
	let in_movement: boolean = false;
	let hover: boolean = false;

	async function handleClick(event: MouseEvent | TouchEvent) {
		assert(
			marker_data.target_article_id === null || marker_data.target_map_id === null,
			'Marker has both article_id and map_id'
		);
		if (marker_data.target_article_id !== null) {
			const id: number =
				store.article.id !== marker_data.target_article_id
					? marker_data.target_article_id
					: store.map.article_id;
			const article = await dtb.get_article(store.project_id, id);
			if (article) {
				store.article = article;
				if(store.informatic_minimized){
					store.informatic_minimized = false;
					store.informatic_opened_by_marker = true;
				}
			}
		} else if (marker_data.target_map_id !== null) {
			if (!store.edit_mode || event.ctrlKey) {
				gotoMap(marker_data.target_map_id);
			}
		}
	}

	function toggle_movement_mouse() {
		if (!in_movement) {
			window.addEventListener('mousemove', move_marker_mouse);
			window.addEventListener('mouseup', stop_movement);
			in_movement = true;
			store.is_panning = false;
			store.selected_marker = marker_data.id;
		}
	}

	function toggle_movement_touch() {
		if (!in_movement) {
			window.addEventListener('touchmove', move_marker_touch);
			window.addEventListener('touchend', stop_movement);
			in_movement = true;
			store.is_panning = false;
			store.selected_marker = marker_data.id;
		}
	}

	function stop_movement() {
		window.removeEventListener('mousemove', move_marker_mouse);
		window.removeEventListener('mouseup', stop_movement);
		window.removeEventListener('touchmove', move_marker_touch);
		window.removeEventListener('touchend', stop_movement);
		dtb.update_marker(marker_data);
		in_movement = false;
	}

	function move_marker_touch(e: TouchEvent) {
		e.stopPropagation;
		if (e.touches.length !== 1) {
			return;
		}
		move_marker(e.touches[0].pageX, e.touches[0].pageY);
	}

	function move_marker_mouse(e: MouseEvent) {
		move_marker(e.x, e.y);
	}

	function move_marker(x_px: number, y_px: number) {
		store.is_panning = false;
		let rel_pos: { x: number; y: number } = get_relative_movement(x_px, y_px);
		marker_data.y = rel_pos.y;
		marker_data.x = rel_pos.x;
		// marker.style.left = rel_pos.x + '%';
		// marker.style.top = rel_pos.y + '%';
	}
</script>

<button
	class="marker"
	bind:this={marker}
	style="top: {marker_data?.y}%; left: {marker_data?.x}%"
	onclick={(event) => {handleClick(event);}}
	onmousedown={(event) => {
		if (store.edit_mode) {
			toggle_movement_mouse();
		}
	}}
	ontouchstart={(event) => {
		if (store.edit_mode) {
			toggle_movement_touch();
		}
	}}
	onmouseenter={() => {
		hover = true;
	}}
	onmouseleave={() => {
		hover = false;
	}}
	class:edit_mode={store.edit_mode}
	class:selected={store.selected_marker === marker_data?.id}
>
	<img
		class="marker-image"
		src={marker_data?.image}
		alt="Marker"
		class:hidden={marker_data?.image === null}
	/>
	{#if hover}
		<MarkerWindow map_id={marker_data.target_map_id} article_id={marker_data.target_article_id} />
	{/if}
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
	.marker.selected {
		border: 2px solid black;
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
