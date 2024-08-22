<script lang="ts">
	import { page } from '$app/stores';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';

	page.subscribe(async (value) => {
		const map_id = +value.params.map_id;
		const map = await dtb.get_map(map_id);
		if (map) {
			store.map = map;
		}
		const article = await dtb.get_article(store.map.article_id);
		if (article) {
			store.article = article;
		}
		const current_markers = await dtb.get_markers(store.map.id);
		if (current_markers) {
			store.markers = current_markers;
		}
	});
</script>

<slot></slot>
