<script lang="ts">
	import { add_article, no_article_link, type UploadModalData, type MapData, type ModalEntity } from '$lib/types';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { assert, assert_unreachable } from '$lib/utils';
	import { goto } from '$app/navigation';
	import MapOption from './MapOption.svelte';
	import { gotoMap } from '$lib/goto_map';

	const get_link_articles = () => {return Object.entries(store.article_cache).map(([id, article]) => {
			return {
				image: article.image ?? '/assets/article_icon.png',
				title: article.title,
				func: () => {
					store.map_article_link = article.id
				}
			};
		})
	}


	const add_map: ModalEntity = {
		image: '/assets/plus.png',
		title: 'Add Map',
		func: () => {
			store.push_modal({type: 'upload_modal', data:{
				submit_func: async (file: File | null, title: string) => {
					if (file === null){return;}
					const selected_marker = store.markers.find(
						(marker) => marker.id === store.selected_marker
					);
					if (selected_marker === undefined) {
						assert_unreachable("Selected marker doesn't exist");
						return;
					}
					let response = await dtb.create_new_map(file, title);
					if (response !== null) {
						selected_marker.target_article_id = null;
						selected_marker.target_map_id = +response.id;
						dtb.update_marker(selected_marker);
						gotoMap(response.id);
					}
				},
				validation_func(file, title) {
					return(file !== null && title !== '')
				},
				link_func(){
					store.push_modal({type: 'choose_modal', data: {Articles: [no_article_link].concat(get_link_articles())}})
				},
				button_title: 'Create map',
				initial_map_title: '',
				initial_image_blob: null,
				initial_link: null,
				allow_no_file: false,
			}})
		}
	};

	async function open_edit_map_modal(){
		store.push_modal({type: 'upload_modal', data: {
			submit_func: async(file: File | null, title: string) => {
				if (file !== null){
					let image_id = await dtb.upload_image(file, 'maps')
					if(!image_id){
						console.error("Image upload failed");
						return;
					}
					store.image_public_urls[image_id] = file;
					store.map.image = image_id;
				}
				store.map.title = title
				await dtb.update_map(store.map)


				return;
			},
			validation_func(file, title) {
				return(file !== null && title !== '' && !(!(file instanceof File) && title === store.map.title))
			},
			link_func(){
				store.push_modal({type: 'choose_modal', data: {Articles: get_link_articles()}})
			},
			button_title: "Update Map",
			initial_map_title: store.map.title,
			initial_image_blob: store.image_public_urls[store.map.image]??null,
			initial_link: store.map.article_id,
			allow_no_file: false,
		}
	})
	}

	async function confirm_delete_map(){
		store.push_modal({type: 'confirm_modal', data: {
			confirm_function: async() => {
				dtb.delete_map(store.map)
				if (store.map.parent_id !== null){gotoMap(store.map.parent_id)}
				else{
					let project = await dtb.get_project(store.project_id)
					if(project){
						gotoMap(project?.head_map_id)
					}
			}
			},
			text: "Are you sure you want to delete this map (this cannot be undone)?"
		}})
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

		store.push_modal({type: 'choose_modal', data: {
			Maps: [add_map].concat(
				Object.entries(store.map_cache).map(([id, map]) => {
					return {
						image: URL.createObjectURL(store.image_public_urls[map.image]),
						title: map.title,
						func: () => {
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
						image: article.image ?? '/assets/article_icon.png',
						title: article.title,
						func: () => {
							if (store.selected_marker === null) {
								return;
							}
							selected_marker.target_map_id = null;
							selected_marker.target_article_id = +id;
							dtb.update_marker(selected_marker);
							store.article = article;
						}
					};
				})
			)
		}})
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
			style="background-image: url('/assets/home_icon.png');"
		>
		</button>
	</div>
	<div class="button_group"></div>
	<div class="button_group"></div>
	<div class="button_group">
		<button
			onclick={confirm_delete_map}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/delete.png');"
			title="Delete map"></button>

		<button
			onclick={open_edit_map_modal}
			class:hidden={!store.edit_mode}
			style="background-image: url('/assets/map_icon.png');"
			title="Edit map"></button>
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
			style="background-image: url('/assets/plus.png');"
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
				? 'double_arrow_left'
				: 'double_arrow_right'}.png');"
		></button>
	</div>
</div>

<style>
	#toolbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 50px; /* TODO: Define once */
		background-color: #4b4343;
		color: white;
		display: flex;
		justify-content:space-around;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 11;
	}

	.button_group{
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
		background-color: #4b4343;
		background-repeat: no-repeat;
	}

	#toolbar button:hover {
		opacity: 0.8; /* Slight hover effect */
	}

	#edit_content_button {
		background: url('/assets/edit-icon.png');
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
