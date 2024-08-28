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

	let unsubscribe = page.subscribe(async (value) => {
		const map_id = +value.params.map_id;
		const map = await dtb.get_map(store.project_id, map_id);
		if (map) {
			store.map = map;
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
