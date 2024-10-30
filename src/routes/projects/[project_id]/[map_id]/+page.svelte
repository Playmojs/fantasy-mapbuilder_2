<script lang="ts">
	import Map from '../../../../components/Map.svelte';
	import { store } from '../../../../store.svelte';
	import Informatic from '../../../../components/Informatic.svelte';
	import Toolbar from '../../../../components/Toolbar.svelte';
	import ParentMap from '../../../../components/ParentMap.svelte';

	import { page } from '$app/stores';
	import dtb from '$lib/dtb';
	import { onDestroy } from 'svelte';
	import { pop_modal } from '$lib/modal_manager';
	import { push_article } from '$lib/article_stack';
	import ModalWindow from '../../../../components/modals/ModalWindow.svelte';

	function reset_modals() {
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
			push_article(article.id, false);
		}
		const current_markers = await dtb.get_markers(store.map.id);
		if (current_markers) {
			store.markers = current_markers;
		}
		// await dtb.fetch_all_from_project(store.project_id)
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<Toolbar />
<Map />
<ParentMap />
{#if !store.informatic_minimized}
	<Informatic />
{/if}

{#each store.modals as modal (modal)}
		<ModalWindow
			close={() => {
				pop_modal();
			}}
			modal={modal}
		/>
	
{/each}
