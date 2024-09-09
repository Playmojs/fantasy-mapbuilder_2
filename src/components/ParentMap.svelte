<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { add_map, type ModalEntity } from '$lib/types';
	import dtb from '$lib/dtb';

	onMount(() => {
		parentMap.addEventListener('click', (event) => parent_func(event, store.map.parent_id));
	});

	const getMaps = async () => {
		await dtb.fetch_all_from_project(store.project_id);
		const maps = Object.entries(store.map_cache).map(([_, map]) => {
			return {
				image: map.image,
				title: map.title,
				func: () => {
					store.map.parent_id = map.id;
					store.map.parent_image = map.image;
					dtb.update_map(store.map);
				}
			};
		});
		return maps;
	};

	async function parent_func(event: MouseEvent | TouchEvent, parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			store.modal_data = {
				entities: [add_map].concat(await getMaps())
			};
		}
		if (parent_id !== null && (!store.edit_mode || event.ctrlKey)) {
			gotoMap(parent_id);
		}
	}

	let remove_map: ModalEntity = {
		image: '/assets/minus.png',
		title: 'Remove Map',
		func: () => {
			if (store.map) {
				store.map.parent_id = null;
				store.map.parent_image = null;
				dtb.update_map(store.map);
			}
		}
	};

	async function changeParentMap() {
		store.modal_data = {
			entities: [remove_map, add_map].concat(await getMaps())
		};
	}
</script>

<img
	src={store.map.parent_image ?? '/assets/parent_plus.png'}
	id="parent_map"
	class:edit_mode={store.edit_mode}
	class:hidden={!store.map.parent_image && !store.edit_mode}
	bind:this={parentMap}
	alt="Parent Map"
/>
<button
	id="edit_map"
	onclick={changeParentMap}
	class:hidden={!store.edit_mode || !store.map.parent_image}
	title="Add parent map"
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
