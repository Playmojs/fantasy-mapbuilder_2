<script lang="ts">
	import { add_article, add_map } from '$lib/types';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { assert, assert_unreachable } from '$lib/utils';
	import { goto } from '$app/navigation';

	function toggleMinimize() {
		store.informatic_minimized = !store.informatic_minimized;
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

		if (selected_marker.target_map_id !== null) {
			store.modal_data = {
				entities: [add_map].concat(
					Object.entries(store.map_cache).map(([id, map]) => {
						return {
							image: map.image,
							title: map.title,
							func: () => {
								if (store.selected_marker === null) {
									return;
								}
								dtb.update_marker({
									...selected_marker,
									target_map_id: +id
								});
							}
						};
					})
				)
			};
		} else {
			store.modal_data = {
				entities: [add_article].concat(
					Object.entries(store.article_cache).map(([id, article]) => {
						return {
							image: article.image ?? '/assets/article_icon.png',
							title: article.title,
							func: () => {
								if (store.selected_marker === null) {
									return;
								}
								dtb.update_marker({
									...selected_marker,
									target_article_id: +id
								});
							}
						};
					})
				)
			};
		}
	}

	let edit_visible: boolean;
	store.write_access.subscribe((value: boolean) => {
		edit_visible = value;
	});
</script>

<div id="toolbar">
	<button
		onclick={() => {
			goto('/projects');
		}}
		style="background-image: url('/assets/home_icon.png');"
	>
	</button>

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

	<button
		id="edit_content_button"
		class:edit_mode={store.edit_mode}
		onclick={toggleEditable}
		class:hidden={!edit_visible}
	></button>
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
	<button
		id="minimize_button"
		onclick={toggleMinimize}
		style="background-image: url('/assets/{store.informatic_minimized
			? 'double_arrow_left'
			: 'double_arrow_right'}.png');"
	></button>
</div>

<style>
	#toolbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 50px; /* TODO: Define once */
		background-color: #4b4343;
		color: white;
		display: flex;
		justify-content: flex-end; /* Ensures buttons are at the right end */
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 11;
	}
	#toolbar button {
		aspect-ratio: 4/3; /* Adjust the size as needed */
		height: 80%; /* Adjust the size as needed */
		border: none;
		padding: 10px;
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
