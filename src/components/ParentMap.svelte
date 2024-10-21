<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { type ModalEntity, type ChooseModal, type ChooseModalData } from '$lib/types';
	import dtb from '$lib/dtb';
	import { choose_existing_map, get_new_map_data, push_modal, push_promise_modal } from '$lib/modal_manager';
	
	onMount(() => {
		parentMap.addEventListener('click', (event) => parent_func(event, store.map.parent_id));
	});

	const choose_parent_map_wrapper = async (entities: ModalEntity<number | null | void>[]) => {
		const result = await push_promise_modal({type: 'choose_modal', data: {Maps: entities}})
		if(result === undefined){return}
		store.map.parent_id = result;
		dtb.update_map(store.map)
	}

	const add_map: ModalEntity<void> = {
		image: '/assets/plus.png',
		title: 'Add Map',
		on_result: async () => {
			let map_info = await get_new_map_data()
			if (map_info === undefined || map_info.file === null || map_info.title === '') {return}
							
			let response = await dtb.create_new_map(store.project_id, map_info.file, map_info.title, map_info.article_id);
			if (response !== null) {
				return response.id
			}
		}
	};


	async function parent_func(event: MouseEvent | TouchEvent, parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			choose_parent_map_wrapper([add_map].concat(await choose_existing_map()))
		}
		if (parent_id !== null && (!store.edit_mode || event.ctrlKey)) {
			gotoMap(parent_id);
		}
	}

	let remove_map: ModalEntity<null | number | void> = {
		image: '/assets/minus.png',
		title: 'Remove Map',
		on_result: () => {
			return null
		}
	};

	async function changeParentMap() {
		choose_parent_map_wrapper([remove_map, add_map].concat(await choose_existing_map()))
	}

	let image_source = $state('/assets/parent_plus.png');
	$effect(() => {
		if (store.map.parent_id !== null) {
			dtb.get_map(store.project_id, store.map.parent_id);

			image_source = store.image_public_urls[store.map_cache[store.map.parent_id]?.image]
				? URL.createObjectURL(store.image_public_urls[store.map_cache[store.map.parent_id].image])
				: '/assets/map_icon.png';
		} else {
			image_source = '/assets/parent_plus.png';
		}
	});

	let minimized = $state<boolean>(false);
</script>

<div id="parent_map_bundle">
	<img
		src={image_source}
		id="parent_map"
		class:edit_mode={store.edit_mode}
		class:hidden={(store.map.parent_id === null && !store.edit_mode) || minimized}
		bind:this={parentMap}
		alt="Parent Map"
	/>
	<div id="parent_map_buttons">
		<button
			id="hide_map"
			onclick={() => {
				minimized = !minimized;
			}}
			class:hidden={store.map.parent_id === null && !store.edit_mode}
			title="Hide parent map"
			style={`background-image: url(/assets/${minimized ? 'plus' : 'minus'}.png);`}
		></button>
		<button
			id="edit_map"
			onclick={changeParentMap}
			class:hidden={!store.edit_mode || store.map.parent_id === null || minimized}
			title="Add parent map"
		></button>
	</div>
</div>

<style>
	#parent_map_bundle {
		position: fixed;
		top: 50px;
		left: 0px;
		width: 15%;
		display: flex;
		justify-content: start;
	}
	#parent_map {
		position: relative;
		width: 100%;
		z-index: 10;
		cursor: pointer;
	}

	#parent_map_buttons {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: start;
	}

	#parent_map_buttons > button {
		position: relative;
		width: 30px;
		aspect-ratio: 1;
		background-size: contain;
		background-color: transparent;
		border-color: transparent;
		cursor: pointer;
	}

	#edit_map {
		background: url('/assets/cog.png');
	}

	.hidden {
		display: none;
	}
</style>
