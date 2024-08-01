<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import { page } from '$app/stores';
	import { MarkerType, SearchParam, type Article, type MapData, type MarkerData } from '$lib/types';
	import Modal from '../../components/Modal.svelte';
	import EntityGrid from '../../components/EntityGrid.svelte';
	import {
		maps,
		current_map,
		current_article,
		current_markers,
		current_map_id
	} from '../../lib/data';

	const handle_map_select = (id: number) => {
		maps.update((maps) => {
			let map_id = $current_map_id;
			maps[map_id].parent_id = id;
			maps[map_id].parent_image = maps[id].image;
			store.show_modal = false;
			return maps;
		});
	};
</script>

<Map markers={$current_markers} image={$current_map.image} />
<ParentMap parent_id={$current_map.parent_id} parent_image={$current_map.parent_image} />
<Informatic text={$current_article.text} article_image={$current_article.article_image} />
<Toolbar />
<Modal visible={store.show_modal} close={() => (store.show_modal = false)}>
	<EntityGrid entities={Object.values($maps)} selectMap={handle_map_select} />
</Modal>
