<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { add_map, type ModalEntity } from '$lib/types';
	import { current_map_id } from '$lib/data.svelte';

	onMount(() => {
		parentMap.addEventListener('click', () => parent_func(store.maps[$current_map_id].parent_id));
	});

	export const getMaps = () => {
		return Object.entries(store.maps).map(([id, map]) => {
			return {
				image: map.image,
				title: map.title,
				func: () => {
					store.maps[$current_map_id].parent_id = +id;
					store.maps[$current_map_id].parent_image = store.maps[+id].image;
				}
			};
		});
	};

	function parent_func(parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			store.modal_data = {
				entities: [add_map].concat(getMaps())
			};
		}
		if (parent_id !== null && !store.edit_mode) {
			gotoMap(parent_id);
		}
	}

	let remove_map: ModalEntity = {
		image: '/assets/minus.png',
		title: 'Remove Map',
		func: () => {
			store.maps[$current_map_id].parent_id = null;
			store.maps[$current_map_id].parent_image = null;
		}
	};

	function changeParentMap() {
		store.modal_data = {
			entities: [remove_map, add_map].concat(getMaps())
		};
	}
</script>

<img
	src={store.maps[$current_map_id].parent_image
		? store.maps[$current_map_id].parent_image
		: '/assets/parent_plus.png'}
	id="parent_map"
	class:edit_mode={store.edit_mode}
	class:hidden={!store.maps[$current_map_id].parent_image && !store.edit_mode}
	bind:this={parentMap}
	alt="Parent Map"
/>
<button
	id="edit_map"
	onclick={changeParentMap}
	class:hidden={!store.edit_mode || !store.maps[$current_map_id].parent_image}
>
</button>

<style>
	#parent_map {
		position: fixed;
		top: 50px;
		right: 85%;
		width: 15%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}

	.hidden {
		display: none;
	}

	#edit_map {
		position: fixed;
		left: 14.5%;
		top: 50px;
		width: 3%;
		height: 3%;
		background: url('/assets/cog.png') no-repeat center center;
		background-size: contain;
		background-color: transparent;
		border-color: transparent;
		cursor: pointer;
	}
</style>
