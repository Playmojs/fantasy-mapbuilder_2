<script lang="ts">
	import Map from '../../../../components/Map.svelte';
	import { store } from '../../../../store.svelte';
	import Informatic from '../../../../components/Informatic.svelte';
	import Toolbar from '../../../../components/Toolbar.svelte';
	import ParentMap from '../../../../components/ParentMap.svelte';
	import Modal from '../../../../components/Modal.svelte';

	import { page } from '$app/stores';
	import dtb from '$lib/dtb';
	import { onDestroy } from 'svelte';
	import ConfirmModal from '../../../../components/ConfirmModal.svelte';
	import MapOption from '../../../../components/MapOption.svelte';

	function reset_modals() {
		store.modal_data = null;
		store.edit_map_window = null;
		store.confirm_modal = null;
		store.modals = [];
	}

	let unsubscribe = page.subscribe(async (value) => {
		reset_modals();
		store.markers = [];
		const map_id = +value.params.map_id;
		const map = await dtb.get_map(store.project_id, map_id);
		if (map) {
			store.map = map;
			if (map.parent_id !== null) {
				await dtb.get_map(store.project_id, map.parent_id);
			}
		}
		const article = await dtb.get_article(store.project_id, store.map.article_id);
		if (article) {
			store.article = article;
		}
		const current_markers = await dtb.get_markers(store.map.id);
		if (current_markers) {
			store.markers = current_markers;
		}
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<Map />
<ParentMap />
{#if !store.informatic_minimized}
	<Informatic />
{/if}
<Toolbar />

{#each store.modals as modal (modal)}
	{#if modal.type === 'upload_modal'}
		<MapOption
			modal_data={modal.data}
			close={() => {
				store.pop_modal();
			}}
			on_close={modal.on_close}
		/>
	{:else if modal.type === 'confirm_modal'}
		<ConfirmModal
			modal_data={modal.data}
			close={() => {
				store.pop_modal();
			}}
		/>
	{:else if modal.type === 'choose_modal'}
		<Modal
			modal_data={modal.data}
			close={() => {
				store.pop_modal();
			}}
			on_close={modal.on_close}
		/>
	{/if}
{/each}
