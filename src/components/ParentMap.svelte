<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { type ModalEntity, type ChooseModalType, type ChooseModalData } from '$lib/types';
	import dtb from '$lib/dtb';
	import { choose_existing_map, get_new_map_data, push_modal, push_promise_modal } from '$lib/modal_manager.svelte';
	
	onMount(() => {
		parentMap.addEventListener('click', (event) => parent_func(event, store.map.parent_id));
	});

	const choose_parent_map_wrapper = async (value: {id: number | null}, entities: ModalEntity[]) => {
		await push_promise_modal({type: 'choose_modal', data: {Maps: entities}, use_search: true})
		store.map.parent_id = value.id;
		dtb.update_map(store.map)
	}

	const add_map: (value: {id: number | null}) => ModalEntity = (value) => {return {
		image: '/assets/fantasy-plus.png',
		title: 'Add Map',
		on_click: async () => {
			let map_info: {file: File | null, title: string, article_id: number | null} = {file: null, title: '', article_id: null};
			await get_new_map_data(map_info);
			if (map_info === undefined || map_info.file === null || map_info.title === '') {return}
							
			let response = await dtb.create_new_map(store.project_id, map_info.file, map_info.title, map_info.article_id);
			if (response !== null) {
				value.id = response.id
			}
		}}
	};


	async function parent_func(event: MouseEvent | TouchEvent, parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			let value: {id: number | null} = {id: null}
			choose_parent_map_wrapper(value, [add_map(value)].concat(await choose_existing_map(value)))
		}
		if (parent_id !== null && (!store.edit_mode || event.ctrlKey)) {
			gotoMap(parent_id);
		}
	}

	let remove_map: (value: {id: number | null}) => ModalEntity = (value) => {return {
			image: '/assets/minus.png',
			title: 'Remove Map',
			on_click: () => {
				value.id = null
			}
		}
	};

	async function changeParentMap() {
		let value: {id: number | null} = {id: null};
		choose_parent_map_wrapper(value, [remove_map(value), add_map(value)].concat(await choose_existing_map(value)));
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
			style={`background-image: url(/assets/${minimized ? 'fantasy-plus' : 'fantasy_minus'}.png);`}
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
		background-repeat: no-repeat;
		background-position: center center;
		border-color: transparent;
		cursor: pointer;
	}

	#edit_map {
		background-image: url('/assets/fantasy_cog.png');
	}

	.hidden {
		display: none;
	}
</style>
