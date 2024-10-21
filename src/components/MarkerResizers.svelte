<script lang="ts">
	import { gotoMap } from '$lib/goto_map';
	import { type MarkerData } from '$lib/types';
	import { get, writable } from 'svelte/store';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import MarkerWindow from './MarkerWindow.svelte';
	import { assert } from '$lib/utils';

    let {marker_data, get_relative_movement}: {marker_data: MarkerData, get_relative_movement: (x: number, y: number) => { x: number; y: number }} = $props()

	let marker_resizer_nw: HTMLButtonElement;
    let marker_resizer_n: HTMLButtonElement;
    let marker_resizer_ne: HTMLButtonElement;
    let marker_resizer_e: HTMLButtonElement;
    let marker_resizer_se: HTMLButtonElement;
    let marker_resizer_s: HTMLButtonElement;
    let marker_resizer_sw: HTMLButtonElement;
    let marker_resizer_w: HTMLButtonElement;
    let marker_resizer_r: HTMLButtonElement;

	let in_movement: boolean = false;
	let horizontal: boolean = false;
	let vertical: boolean = false;
	let start_pos: {x: number, y: number};
	let horizontal_factor: number;
	let vertical_factor: number;
	let marker_start: {x: number, y: number};
	let initial_width_and_height: {width: number, height: number};

	function toggle_mouse(e: MouseEvent) {
		marker_start = {x: marker_data.x, y: marker_data.y}
		initial_width_and_height = {width: marker_data.width, height: marker_data.height}
		start_pos = get_relative_movement(e.pageX, e.pageY);
		horizontal_factor = start_pos.x > marker_start.x ? 1 : -1;
		vertical_factor = start_pos.y > marker_start.y ? 1 : -1;
		
		e.stopPropagation
		if (!in_movement) {
			window.addEventListener('mousemove', move_by_mouse);
			window.addEventListener('mouseup', stop_movement);
			in_movement = true;
			store.is_panning = false;
		}
	}

	function toggle_movement_touch(e: TouchEvent) {
		marker_start = {x: marker_data.x, y: marker_data.y}
		initial_width_and_height = {width: marker_data.width, height: marker_data.height}
		start_pos = get_relative_movement(e.touches[0].pageX, e.touches[0].pageY);
		horizontal_factor = start_pos.x > marker_start.x ? 1 : -1;
		vertical_factor = start_pos.y > marker_start.y ? 1 : -1;
		

		e.stopPropagation
		if (!in_movement) {
			window.addEventListener('touchmove', move_by_touch);
			window.addEventListener('touchend', stop_movement);
			in_movement = true;
			store.is_panning = false;
		}
	}

	function stop_movement() {
		window.removeEventListener('mousemove', move_by_mouse);
		window.removeEventListener('mouseup', stop_movement);
		window.removeEventListener('touchmove', move_by_touch);
		window.removeEventListener('touchend', stop_movement);
		dtb.update_marker(marker_data);
		in_movement = false;
	}

	function move_by_touch(e: TouchEvent) {
		e.stopPropagation;
		if (e.touches.length !== 1) {
			return;
		}
		move(e.touches[0].pageX, e.touches[0].pageY);
	}

	function move_by_mouse(e: MouseEvent) {
		e.stopPropagation;
		move(e.x, e.y);
	}

	function move(x_px: number, y_px: number) {
		store.is_panning = false;
		let rel_pos: { x: number; y: number } = get_relative_movement(x_px, y_px);
		if(vertical){
			marker_data.y = marker_start.y + (rel_pos.y-start_pos.y) / 2;
			marker_data.height = Math.abs(initial_width_and_height.height + vertical_factor*(rel_pos.y - start_pos.y));
		}
		if(horizontal){
			marker_data.x = marker_start.x + (rel_pos.x-start_pos.x) / 2;
			marker_data.width = Math.abs(initial_width_and_height.width + horizontal_factor*(rel_pos.x - start_pos.x));
		}
	}

</script>

<button id='ne' bind:this={marker_resizer_ne} class={"ne-sw"}
    onmousedown={(event) => {horizontal = true; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y - marker_data?.height / 2}%; left: {marker_data?.x + marker_data?.width / 2}%">
</button>

<button id='nw' bind:this={marker_resizer_nw} class={"nw-se"}
    onmousedown={(event) => {horizontal = true; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y - marker_data?.height / 2}%; left: {marker_data?.x - marker_data?.width / 2}%">
</button>

<button id='se' bind:this={marker_resizer_se} class={"nw-se"}
    onmousedown={(event) => {horizontal = true; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y + marker_data?.height / 2}%; left: {marker_data?.x + marker_data?.width / 2}%">
</button>

<button id='sw' bind:this={marker_resizer_sw} class={"ne-sw"}
    onmousedown={(event) => {horizontal = true; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y + marker_data?.height / 2}%; left: {marker_data?.x - marker_data?.width / 2}%">
</button>

<button id='e' bind:this={marker_resizer_e} class={'horizontal'}
    onmousedown={(event) => {horizontal = true; vertical = false; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = false; toggle_movement_touch(event);}}
    style="top: {marker_data?.y}%; left: {marker_data?.x + marker_data?.width / 2}%">
</button>

<button id='w' bind:this={marker_resizer_w} class={'horizontal'}
    onmousedown={(event) => {horizontal = true; vertical = false; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = true; vertical = false; toggle_movement_touch(event);}}
    style="top: {marker_data?.y}%; left: {marker_data?.x - marker_data?.width / 2}%">
</button>

<button id='n' bind:this={marker_resizer_n} class={'vertical'}
    onmousedown={(event) => {horizontal = false; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = false; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y - marker_data?.height / 2}%; left: {marker_data?.x}%">
</button>

<button id='s' bind:this={marker_resizer_s} class={'vertical'}
    onmousedown={(event) => {horizontal = false; vertical = true; toggle_mouse(event);}}
    ontouchstart={(event) => {horizontal = false; vertical = true; toggle_movement_touch(event);}}
    style="top: {marker_data?.y + marker_data?.height / 2}%; left: {marker_data?.x}%">
</button>

<style>
    button{
        position: absolute;
        background-color: white;
        width: 1%;
        aspect-ratio: 1;
		transform: translate(-50%, -50%);
    }

	.ne-sw{
		cursor: nesw-resize;
	}

	.nw-se{
		cursor: nwse-resize;
	}

	.horizontal{
		cursor: ew-resize;
	}

	.vertical{
		cursor: ns-resize;
	}
</style>

	
