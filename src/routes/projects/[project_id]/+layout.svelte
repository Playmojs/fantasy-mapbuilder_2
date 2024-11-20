<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { store } from '../../../store.svelte';
	import dtb, { supabase } from '$lib/dtb';
	import { browser } from '$app/environment';

	let unsubscribe = page.subscribe(async (value) => {
		store.project_id = +value.params.project_id;

		store.write_access = await dtb.check_write_access();
		dtb.get_project(store.project_id);
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<slot></slot>
