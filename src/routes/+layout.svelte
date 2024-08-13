<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/dtb';
	import { store } from '../store.svelte';

	page.subscribe(async (value) => {
		const map_id = +value.params.map_id;
		await supabase
			.from('map')
			.select()
			.eq('id', map_id)
			.single()
			.then(({ data, error }) => {
				if (error) {
					console.error(error);
				}
				if (data) {
					store.map = data;
				}
			});
		let marker_ids = store.map?.marker_ids ?? [];
		await supabase
			.from('marker')
			.select()
			.in('id', marker_ids)
			.then(({ data, error }) => {
				if (error) {
					console.error(error);
				}
				if (data) {
					store.markers = data;
				}
			});
		let article_id = store.map?.article_id ?? null;
		if (article_id) {
			await supabase
				.from('article')
				.select()
				.eq('id', article_id)
				.single()
				.then(({ data, error }) => {
					if (error) {
						console.error(error);
					}
					if (data) {
						store.article = data;
					}
				});
		}
	});
</script>

<slot></slot>
