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
	import MapOption from '../../../../components/MapOption.svelte';
	import ConfirmModal from '../../../../components/ConfirmModal.svelte';

	function reset_modals(){
		store.modal_data = null;
		store.edit_map_window = null;
		store.confirm_modal = null;
	}

	let unsubscribe = page.subscribe(async (value) => {
		reset_modals()
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
<Modal close={() => (store.modal_data = null)} modal_data={store.modal_data} />
<MapOption />
<ConfirmModal close={() => (store.confirm_modal = null)} />
