<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';

	export let parent_image: string | null;
	export let parent_id: number | null;

	onMount(() => {
		parentMap.addEventListener('click', () => parent_func(parent_id));
	});

	function parent_func(parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			store.show_modal = true;
		}
		if (parent_id !== null && !store.edit_mode) {
			gotoMap(parent_id);
		}
	}
</script>

<img
	src={parent_image ? parent_image : '/assets/parent_plus.png'}
	id="parent_map"
	class:edit_mode={store.edit_mode}
	class:hidden={!parent_image && !store.edit_mode}
	bind:this={parentMap}
	alt="Parent Map"
/>
<button
	id="edit_map"
	onclick={() => {
		store.show_modal = true;
	}}
	class:hidden={!store.edit_mode || !parent_image}
>
</button>

<style>
	#parent_map {
		position: fixed;
		top: 0%;
		right: 85%;
		width: 15%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}
	#parent_map.edit_mode {
		top: 7%;
	}

	.hidden {
		display: none;
	}

	#edit_map {
		position: fixed;
		left: 14.5%;
		top: 7%;
		width: 3%;
		height: 3%;
		background: url('/assets/cog.png') no-repeat center center;
		background-size: contain;
		background-color: transparent;
		border-color: transparent;
		cursor: pointer;
	}
</style>
