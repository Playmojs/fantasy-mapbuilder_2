<script lang="ts">
	import { goto } from '$app/navigation';
	import edit_mode, {toggle_informatic} from '../store'

	export let position: { x: number; y: number };
	export let image: string;
	export let query_id: number;
	export let get_relative_movement: Function;
	export let informatic: boolean;

	let marker: HTMLButtonElement;
	
	let in_movement: boolean = false;

	let editable;
	$: editable = $edit_mode;

	let toggle_informatic_text: any;
	$: toggle_informatic_text = $toggle_informatic;

	import { createEventDispatcher } from 'svelte';

	function handleClick() {
		if(informatic)
		{
			toggle_informatic_text(query_id)
		} else {
		location.href = `/${query_id}`;
	}}

	function toggle_movement()
	{
		if (!in_movement){
			window.addEventListener('mousemove', move_marker);
			window.addEventListener('mouseup', stop_movement);
			in_movement = true
		}
	}

	function stop_movement()
	{
		window.removeEventListener('mousemove', move_marker);
		window.removeEventListener('mouseup', stop_movement);
		in_movement = false;
	}

	function move_marker(e: MouseEvent) {
		let rel_pos: {x: number, y: number} = get_relative_movement(e.x, e.y);
		marker.style.left = rel_pos.x + '%';		
		marker.style.top = rel_pos.y + '%';
	}
</script>

<button class="marker" bind:this={marker} style="top: {position.y}%; left: {position.x}%" on:mousedown={editable? toggle_movement: handleClick} class:edit_mode={editable}>
	<img class="marker-image" src={image} alt="Marker">
</button>

<style>
	.marker {
		position: absolute;
		width: 3%;
		height: 3%;
		border-radius: 50%;
		cursor: pointer;
		transform: translate(-50%, -50%);
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
</style>
