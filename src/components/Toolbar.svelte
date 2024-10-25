<script lang="ts">
	import {
		type UploadModalData,
		type MapData,
		type ModalEntity,
		type UploadModal,

		type ChooseModalData

	} from '$lib/types';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { assert, assert_unreachable } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { gotoMap } from '$lib/goto_map';
	import { choose_article_by_id, push_promise_modal, choose_no_article, add_article, link_article, get_new_map_data, push_modal, choose_map_or_article, type map_or_article} from '$lib/modal_manager';

	const add_map: ModalEntity<void> = {
		image: '/assets/plus.png',
		title: 'Add Map',
		on_result: async () => {
			const map_info = await get_new_map_data()
			if (map_info === undefined || map_info.file === null || map_info.title === ''){return}
			
			const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
			if (selected_marker === undefined) {
				assert_unreachable("Selected marker doesn't exist");
				return;
			}

			let response = await dtb.create_new_map(store.project_id, map_info.file, map_info.title, map_info.article_id);
			if (response !== null) {
				selected_marker.target_article_id = null;
				selected_marker.target_map_id = +response.id;
				dtb.update_marker(selected_marker);
				gotoMap(response.id);
			}
			
		}
	};

	async function open_edit_map_modal() {
		push_modal({
			type: 'upload_modal',
			data: {
				submit_func: async (file: File | null, title: string) => {
					if (file !== null) {
						let image_id = await dtb.upload_image(store.project_id, file, 'maps', null);
						if (!image_id) {
							console.error('Image upload failed');
							return;
						}
						store.image_public_urls[image_id] = file;
						store.map.image = image_id;
					}
					store.map.title = title;
					await dtb.update_map(store.map);

					return;
				},
				validation_func(file: File | Blob | null, title, article_id) {
					return (
						file !== null && title !== '' && article_id !== null && (file instanceof File || title !== store.map.title || article_id !== store.map.article_id)
					);
				},
				link_func: async () => {
					const result = await push_promise_modal<number | null>({
						type: 'choose_modal',
						data: { Articles: choose_article_by_id() }
					});
					if (typeof result === 'number' || result === null) {
						return result;
					}
				},
				button_title: 'Update Map',
				initial_map_title: store.map.title,
				initial_image_blob: store.image_public_urls[store.map.image] ?? null,
				initial_link: store.map.article_id,
				allow_no_file: false
			}
		});
	}

	async function confirm_delete_map() {
		push_modal({
			type: 'confirm_modal',
			data: {
				confirm_function: async () => {
					dtb.delete_map(store.map);
					if (store.map.parent_id !== null) {
						gotoMap(store.map.parent_id);
					} else {
						let project = await dtb.get_project(store.project_id);
						if (project) {
							gotoMap(project.head_map_id);
						}
						else (goto('/'))
					}
				},
				text: 'Are you sure you want to delete this map (this cannot be undone)?'
			}
		});
	}

	const go_to_article_or_map_modal = async () => {
		await dtb.fetch_all_from_project(store.project_id);
		const result = await push_promise_modal({type: 'choose_modal', data: choose_map_or_article()})
		if(result === undefined){return}
		if(result.map_id !== null){
			gotoMap(result.map_id)
		}
		else if (result.article_id !== null){
			const article = await dtb.get_article(store.project_id, result.article_id)
			if(article){
				store.article_history.push(article.id)
			}
		}
	}

	function toggleMinimize() {
		store.informatic_minimized = !store.informatic_minimized;
		store.informatic_opened_by_marker = false;
	}

	async function toggleEditable() {
		store.selected_marker = null;
		store.edit_mode = !store.edit_mode;
		if (store.edit_mode) {
			await dtb.fetch_all_from_project(store.project_id);
		}
	}

	function change_text_size(factor: number) {
		store.text_size = store.text_size * factor;
	}

	async function changeMarkerTarget() {
		if (store.selected_marker === null) {
			return;
		}
		const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
		if (selected_marker === undefined) {
			assert_unreachable("Selected marker doesn't exist");
			return;
		}

		assert(
			selected_marker.target_article_id === null || selected_marker.target_map_id === null,
			'Marker has both article_id and map_id'
		);

		push_modal({
			type: 'choose_modal',
			data: {
				Maps: [add_map].concat(
					Object.entries(store.map_cache).map(([id, map]) => {
						return {
							image: URL.createObjectURL(store.image_public_urls[map.image]),
							title: map.title,
							on_result: () => {
								if (store.selected_marker === null) {
									return;
								}
								selected_marker.target_article_id = null;
								selected_marker.target_map_id = +id;
								dtb.update_marker(selected_marker);
							}
						};
					})
				),
				Articles: [add_article].concat(
					Object.entries(store.article_cache).map(([id, article]) => {
						return {
							image:
								article.image && store.image_public_urls[article.image]
									? URL.createObjectURL(store.image_public_urls[article.image])
									: '/assets/Parchment.png',
							title: article.title,
							on_result: () => {
								if (store.selected_marker === null) {
									return;
								}
								selected_marker.target_map_id = null;
								selected_marker.target_article_id = +id;
								dtb.update_marker(selected_marker);
								store.article_history.push(article.id);
							}
						};
					})
				)
			}
		});
	}

	let edit_visible: boolean;
	store.write_access.subscribe((value: boolean) => {
		edit_visible = value;
	});
</script>

<div id="toolbar">
	<div class="button_group">
		<button
			onclick={() => {
				goto('/projects');
			}}
			style="background-image: url('/assets/house.png');"
		>
		</button>
		<button
			onclick={()=>{go_to_article_or_map_modal()}}
			style="background-image: url('/assets/old_map.png');"
			>
		</button>
	</div>
	<div class="button_group"></div>
	<div class="button_group"></div>
	<div class="button_group">
		<button
			onclick={confirm_delete_map}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/old_trashcan.png');"
			title="Delete map"
		></button>

		<button
			onclick={open_edit_map_modal}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/old_map.png');"
			title="Edit map"
		></button>
	</div>

	<div class="button_group">
		<button
			onclick={() => dtb.delete_marker(store.selected_marker)}
			class:hidden={!store.edit_mode || store.selected_marker === null}
			style="background-image: url('/assets/delete_marker.png');"
			title="Delete selected marker"
		></button>
		<button
			onclick={() => {
				changeMarkerTarget();
			}}
			style="background-image: url('/assets/change_marker.png');"
			title="Set target of selected marker"
			class:hidden={!store.edit_mode || store.selected_marker === null}
		></button>

		<button
			onclick={(_event: MouseEvent) => dtb.create_and_select_marker_in_current_map()}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/add_marker.png');"
			title="Add new marker to map"
		></button>
	</div>

	<div class="button_group">
		<button
			id="edit_content_button"
			class:edit_mode={store.edit_mode}
			onclick={toggleEditable}
			class:hidden={!edit_visible}
		></button>
	</div>

	<div class="button_group">
		<button
			id="increment_text_size_button"
			onclick={() => {
				change_text_size(1.1);
			}}
			style="background-image: url('/assets/fantasy-plus.png');"
			title="Increase text size"
			class:hidden={store.informatic_minimized}
		></button>

		<button
			id="decrement_text_size_button"
			onclick={() => {
				change_text_size(0.9);
			}}
			style="background-image: url('/assets/minus.png');"
			title="Decrease text size"
			class:hidden={store.informatic_minimized}
		></button>
	</div>

	<div class="button_group">
		<button
			id="minimize_button"
			onclick={toggleMinimize}
			style="background-image: url('/assets/{store.informatic_minimized
				? 'Arrows_left'
				: 'Arrows_right'}.png');"
		></button>
	</div>
</div>

<style>
	#toolbar {
		touch-action: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 50px; /* TODO: Define once */
		background-color: #333;
		color: var(--main_white);
		display: flex;
		flex-wrap: wrap;
		justify-content:space-around;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 11;
	}

	.button_group {
		display: flex;
		justify-content: center;
		gap: 10px;
		align-items: center;
		height: 100%;
		width: 5%;
	}

	#toolbar button {
		aspect-ratio: 4/3; /* Adjust the size as needed */
		height: 80%; /* Adjust the size as needed */
		border: none;
		cursor: pointer;
		background-size: contain;
		background-position: center center;
		background-color: transparent;
		background-repeat: no-repeat;
	}

	#toolbar button:hover {
		opacity: 0.8; /* Slight hover effect */
	}

	#edit_content_button {
		background: url('/assets/quill.png');
		margin-left: 10%;
	}

	#edit_content_button.edit_mode {
		background-color: #111;
	}

	#increment_text_size_button {
		margin-left: 5%;
	}

	.hidden {
		display: none;
	}
</style>
