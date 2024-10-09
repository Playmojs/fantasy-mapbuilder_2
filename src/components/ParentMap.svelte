<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { type ModalEntity } from '$lib/types';
	import dtb from '$lib/dtb';
	import { assert_unreachable } from '$lib/utils';

	onMount(() => {
		parentMap.addEventListener('click', (event) => parent_func(event, store.map.parent_id));
	});

	const add_map: ModalEntity = {
		image: '/assets/plus.png',
		title: 'Add Map',
		func: () => {
			store.edit_map_window = {
				submit_func: async (file: File | null, title: string) => {
					if(file === null){
						assert_unreachable("No file selected error"); 
						return;
					}
					let response = await dtb.create_new_map(file, title);
					if (response !== null) {
						store.map.parent_id = response.id;
						store.map.parent_image = response.image;
						dtb.update_map(store.map);
					}
				},
				validation_func(file, title) {
					return(file !== null && title !== '')
				},
				button_title: 'Create Map',
				initial_image_blob: null,
				initial_map_title: '',
				allow_no_file: false,
			};
		}
	};

	const getMaps = async () => {
		await dtb.fetch_all_from_project(store.project_id);
		const maps = Object.entries(store.map_cache).map(([_, map]) => {
			return {
				image: URL.createObjectURL(store.image_public_urls[map.image]),
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
	$inspect(store.map_cache[store.map.id])

	async function parent_func(event: MouseEvent | TouchEvent, parent_id: number | null) {
		if (parent_id === null && store.edit_mode) {
			store.modal_data = {
				Maps: [add_map].concat(await getMaps())
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
			Maps: [remove_map, add_map].concat(await getMaps())
		};
	}

	let image_source = $state('/assets/parent_plus.png');
	$effect(() => {
		if (store.map.parent_image !== null) {
			if (store.image_public_urls[store.map.parent_image]) {
				image_source = URL.createObjectURL(store.image_public_urls[store.map.parent_image]);
			} else {
				image_source = '/assets/map_icon.png';
			}
		} else {
			image_source = '/assets/parent_plus.png';
		}
	});
</script>

<img
	src={image_source}
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
