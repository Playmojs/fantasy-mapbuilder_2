<script lang="ts">
	import { onMount } from 'svelte';

	let parentMap: HTMLImageElement;

	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { no_article_link, type ModalEntity, type ChooseModal } from '$lib/types';
	import dtb from '$lib/dtb';
	import { assert_unreachable } from '$lib/utils';
	import { push_promise_modal } from '$lib/modal_manager';

	onMount(() => {
		parentMap.addEventListener('click', (event) => parent_func(event, store.map.parent_id));
	});

	const get_link_articles: () => ModalEntity<number>[] = () => {
		return Object.entries(store.article_cache).map(([id, article]) => {
			return {
				image:
					article.image && store.image_public_urls[article.image]
						? URL.createObjectURL(store.image_public_urls[article.image])
						: '/assets/article_icon.png',
				title: article.title,
				on_result: () => {
					return article.id;
				}
			};
		});
	};

	const add_map: ModalEntity<void> = {
		image: '/assets/plus.png',
		title: 'Add Map',
		on_result: () => {
			store.push_modal({
				type: 'upload_modal',
				data: {
					submit_func: async (file: File | null, title: string) => {
						if (file === null) {
							assert_unreachable('No file selected error');
							return;
						}
						let response = await dtb.create_new_map(file, title);
						if (response !== null) {
							store.map.parent_id = response.id;
							store.map.parent_image = response.image;
							dtb.update_map(store.map);
						}
					},
					validation_func(file: Blob | File | null, title: string) {
						return file !== null && title !== '';
					},
					link_func: async () => {
						const result = await push_promise_modal<number | null>({
							type: 'choose_modal',
							data: { Articles: [no_article_link].concat(get_link_articles()) }
						});
						if (typeof result === 'number' || result === null) {
							return result;
						}
					},
					button_title: 'Create Map',
					initial_image_blob: null,
					initial_map_title: '',
					initial_link: null,
					allow_no_file: false
				}
			});
		}
	};

	const getMaps = async () => {
		await dtb.fetch_all_from_project(store.project_id);
		const maps = Object.entries(store.map_cache).map(([_, map]) => {
			return {
				image: URL.createObjectURL(store.image_public_urls[map.image]),
				title: map.title,
				on_result: () => {
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
			store.push_modal({ type: 'choose_modal', data: { Maps: [add_map].concat(await getMaps()) } });
		}
		if (parent_id !== null && (!store.edit_mode || event.ctrlKey)) {
			gotoMap(parent_id);
		}
	}

	let remove_map: ModalEntity<void> = {
		image: '/assets/minus.png',
		title: 'Remove Map',
		on_result: () => {
			if (store.map) {
				store.map.parent_id = null;
				store.map.parent_image = null;
				dtb.update_map(store.map);
			}
		}
	};

	async function changeParentMap() {
		store.push_modal({
			type: 'choose_modal',
			data: { Maps: [remove_map, add_map].concat(await getMaps()) }
		});
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
