<script lang="ts">
	import {
		type ModalEntity,
		type UploadModalType,
		type GraphModalData,
		type MapUpload,
	} from '$lib/types';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { assert, assert_unreachable } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { gotoMap } from '$lib/goto_map';
	import { push_promise_modal, add_article_to_marker, link_article, get_new_map_data, push_modal, choose_map_or_article, get_composite_category_modal, get_choose_category_to_edit_modal, get_article_to_category_modal} from '$lib/modal_manager.svelte';
	import { push_article } from '$lib/article_stack';
	import DropdownMapAndArticleSearch from './DropdownMapAndArticleSearch.svelte';
	import { generate_category_graph, generate_map_graph } from '$lib/graph_gen.svelte';
	import { theme_entities, units } from '$lib/data.svelte';
	const add_map: ModalEntity = {
		image: '/assets/plus.png',
		title: 'Add Map',
		on_click: async () => {
			let map_info: {file: File | null, title: string, article_id: number | null, scale: number | null} = {file: null, title: '', article_id: null, scale: null};
			await get_new_map_data(map_info)
			console.log(map_info.scale)
			if (map_info === undefined || map_info.file === null || map_info.title === ''){return}
			
			const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
			if (selected_marker === undefined) {
				assert_unreachable("Selected marker doesn't exist");
				return;
			}

			let response = await dtb.create_new_map(store.project_id, map_info.file, map_info.title, map_info.article_id, map_info.scale);
			if (response !== null) {
				selected_marker.target_article_id = null;
				selected_marker.target_map_id = +response.id;
				dtb.update_marker(selected_marker);
				gotoMap(response.id);
			}
			
		}
	};

	async function open_edit_map_modal() {
		const upload_modal: UploadModalType<MapUpload> = {
			type: 'upload_modal',
			data: {
				inputs: [
					{type: 'text', name: 'title', label: 'Title', required: true },
					{type: 'file', name: 'file', label: 'Upload File', required: false},
					{type: 'button', name: 'article_link', label: 'Link Article', on_click: async (state: MapUpload) => {
						let value: {id: number | null, title: string} = {id: null, title: ''};
						await link_article(value);
						state.article_link = value;
					},
					display_text(state) {
						return (state.article_link.title)
					},},
					{type: 'number', name: 'scale', label: 'Map Scale', required: false, unit: {units: Object.values(units).map(unit => {return {id: unit.id, name: unit.name}}), on_click(state, value) {
						state.unit_id = value
					}} }, 
				],
				initial_state: {title: store.map.title, file: store.image_public_urls[store.map.image], article_link: {id: store.map.article_id, title: store.article_cache[store.map.article_id].title}, scale: store.map.scale, unit_id: 0},
				validation_func: (state) => {
					return (
						(state.scale !== undefined) && state.file !== null && state.title !== '' && state.article_link !== null && (state.file !== store.image_public_urls[store.map.image] || state.title !== store.map.title || state.article_link.id !== store.map.article_id || state.scale !== store.map.scale || state.unit_id !== 0)
					);
				},
				submit_func: async (state) => {
					if (state.file instanceof File) {
						let image_id = await dtb.upload_image(store.project_id, state.file, 'maps', null);
						if (!image_id) {
							console.error('Image upload failed');
							return;
						}
						store.image_public_urls[image_id] = state.file;
						store.map.image = image_id;
					}
					store.map.title = state.title;
					if(state.article_link.id !== null){
						store.map.article_id = state.article_link.id;
					}
					if(state.scale === undefined || state.scale === null){store.map.scale = null}
					else{store.map.scale = state.scale * (state.unit_id !== null ? units[state.unit_id].factor : 1)}

					await dtb.update_map(store.map);

					return;
				},
				determine_preview(state) {
					if(state.file === null){return null}
					return URL.createObjectURL(state.file)
				},
				button_title: 'Update Map'
				}
		}

		push_modal(upload_modal);
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
		let value: {map_id: number| null, article_id: number | null} = {map_id: null, article_id: null}
		await push_promise_modal({type: 'choose_modal', data: choose_map_or_article(value), use_search: true})
		if(value.article_id === null && value.map_id === null){return}
		else if(value.map_id !== null){
			gotoMap(value.map_id)
		}
		else if (value.article_id !== null){
			const article = await dtb.get_article(store.project_id, value.article_id)
			if(article){
				push_article(article.id, false);
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
							on_click: () => {
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
				Articles: [add_article_to_marker].concat(
					Object.entries(store.article_cache).map(([id, article]) => {
						return {
							image:
								article.image && store.image_public_urls[article.image]
									? URL.createObjectURL(store.image_public_urls[article.image])
									: '/assets/Parchment.png',
							title: article.title,
							on_click: () => {
								if (store.selected_marker === null) {
									return;
								}
								selected_marker.target_map_id = null;
								selected_marker.target_article_id = +id;
								dtb.update_marker(selected_marker);
								push_article(article.id, false);
							}
						};
					})
				)
			},
			use_search: true
		});
	}

	async function open_map_graph(){
		await dtb.fetch_all_from_project(store.project_id);
		let graph = generate_map_graph();
		let graph_data: GraphModalData = {graph_entities: {}, head_id: store.project_cache[store.project_id].head_map_id};
		Object.entries(graph).forEach(([id, value]) => {
			const entity: ModalEntity = {
				title: store.map_cache[+id].title,
				image: URL.createObjectURL(store.image_public_urls[store.map_cache[+id].image]),
				on_click: () => {gotoMap(+id)}
			}
			graph_data.graph_entities[+id] = {
				children: value,
				entity: entity
			}
		})
		push_modal({type: 'graph_modal', data: graph_data, use_search: false})
	}

	let edit_visible = $derived<boolean>(store.write_access);

	let category_graph_data = $state<GraphModalData>({graph_entities: {}, head_id: -1});

	// This is quite a stupid setup, because one would think that a simple $derived.by could replace this $effect. Maybe it can, but I haven't been able to make it work.
	// The idea is that category_graph_data should be deeply reactive, but with $derived it isn't. When I define it as state, and update with effect, it gets deeply reactive.

	$effect(()=> {
		store.category_links;
		const category_graph: {[id: number]: number[]} = ({[-1]: generate_category_graph(), ...store.category_links})
		Object.entries(category_graph).forEach(([id, value]) => {
			const entity: ModalEntity = {
				title: +id === -1 ? 'Categories' : store.category_cache[+id].name,
				image: null,
				background_image: theme_entities[store.category_cache[+id]?.theme_id]?.image,
				on_click: () => {return},
				optional_func: ()=>{push_modal(+id !== -1 ? get_composite_category_modal({...store.category_cache[+id]}) : get_choose_category_to_edit_modal())}
			};
			category_graph_data.graph_entities[+id] = {
				children: value,
				entity: entity
			}
		})
	})

	async function open_category_graph(){
		if(!category_graph_data){return}
		await dtb.fetch_all_from_project(store.project_id);
		const article_entities: {[id: number]: ModalEntity} = {};
		Object.entries(store.article_cache).forEach(([key, article]) => 
			{
				article_entities[+key] = {
					image: null,
					title: article.title,
					on_click(){
						push_article(article.id, false);
						push_modal({type: 'article_modal', data: article.id})},
					background_image: article.main_category !== null ? theme_entities[store.category_cache[article.main_category].theme_id].image : null,
					optional_func(){push_modal({type: 'category_modal', data: get_article_to_category_modal(+key)})},
				}
			}
		)

		push_modal({type: 'filter_modal', data: {graph_data: category_graph_data, filter_link: store.article_category_links, choose_data: article_entities}, use_search: true})
	}
</script>

<div id="toolbar">
	<div class="button_group">
		<button
			onclick={() => {
				goto('/projects');
			}}
			style="background-image: url('/assets/house.png');"
			aria-label="Home Button"
			title="Home"
		>
		</button>
		<button
			onclick={()=>{go_to_article_or_map_modal();}}
			style="background-image: url('/assets/goto_map_article_icon.png');"
			aria-label="Go to Map or Article"
			title="Go to Map or Article"
			>
		</button>
	</div>
	<div class='button_group'>
		<button
			onclick={()=>{open_map_graph();}}
			style="background-image: url('/assets/map_graph_icon_2.png');"
			aria-label="Open Map Graph"
			title="Open Map Graph"
			>
		</button>
		<button
			onclick={()=>{open_category_graph();}}
			style="background-image: url('/assets/category_graph_icon_2.png');"
			aria-label="Open Category Graph"
			title="Open Category Graph"
			>
		</button>
	</div>
	<div id="search_bar">
		<DropdownMapAndArticleSearch/>
	</div>
	<div class="button_group">
		<button
			onclick={confirm_delete_map}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/old_trashcan.png');"
			title="Delete map"
			aria-label="Delete Map"
		></button>

		<button
			onclick={open_edit_map_modal}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/old_map.png');"
			title="Edit map"
			aria-label="Edit Map"
		></button>
	</div>
	
	<div class="button_group" id='edit_marker_group' class:transparent={!store.edit_mode}>
		<button
			onclick={() => {
				changeMarkerTarget();
			}}
			disabled={store.selected_marker === null}
			style="background-image: url('/assets/quill and scroll.png');"
			title="Set target of selected marker"
			class:hidden={!store.edit_mode}
			aria-label="Set Marker Target"
		></button>
		<button
			onclick={() => dtb.delete_marker(store.selected_marker)}
			class:hidden={!store.edit_mode}
			disabled={store.selected_marker === null}
			style="background-image: url('/assets/minus_2.png');"
			title="Delete selected marker"
			aria-label="Delete Marker"
		></button>

		<button
			onclick={(_event: MouseEvent) => dtb.create_and_select_marker_in_current_map()}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/+ and - +.png');"
			title="Add new marker to map"
			aria-label="Add New Marker"
		></button>
	</div>

	<div class="button_group">
		<button
			id="edit_content_button"
			class:pressed={store.edit_mode}
			onclick={toggleEditable}
			class:hidden={!edit_visible}
			aria-label="Edit Project"
		></button>
	</div>

	<div class="button_group">
		<button
			onclick={()=>{store.unit_group === 'Metric' ? store.unit_group = 'Imperial' : store.unit_group = 'Metric'}}
			style="background-image: url('/assets/Measure_edit.png')">
		</button>
		<button 
			onclick={()=>{store.drawing_path = !store.drawing_path}} 
			class:hidden={store.map.scale === null}
			class:pressed={store.drawing_path}
			style="background-image: url('/assets/MapDistanceIcon.png')">
		</button>	
		<button
			id="minimize_button"
			onclick={toggleMinimize}
			style="background-image: url('/assets/{store.informatic_minimized
				? 'Arrows_left'
				: 'Arrows_right'}.png');"
			aria-label="Toggle Informatic"
		></button>
	</div>
</div>

<style>
	#toolbar {
		flex: 0 0 50px;

		display: flex;
		justify-content: space-around;
		align-items: center;

		background-color: #333;
		color: var(--main_white);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 11;
	}

	.button_group {
		flex: 0 1 150px;
		 
		display: flex;
		justify-content: center;
		gap: 10px;
		align-items: center;
		height: 100%;
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

	#search_bar{
		flex: 1 0 fit-content;
	}
	
	#edit_marker_group{
		height: 90%;
		width: 150px;
		height: 80%;
		flex: 0 1 200px;
		flex-shrink: 0;
		background-image: url('/assets/image_frame_test.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;
		background-position: center center;
		gap: 5px;
	}

	#edit_marker_group.transparent{
		background-image: none;
	}

	#edit_marker_group > button{
		height: 70%;
	}

	#toolbar button:disabled{
		cursor: default;
		box-shadow: none;
		opacity: 1;
		filter:brightness(30%);
	}

	#edit_content_button {
		background: url('/assets/quill.png');
	}

	#toolbar button.pressed {
		background-color: #111;
		filter: brightness(40%);
	}

	.hidden {
		display: none;
	}
</style>
