<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { store } from '../../../store.svelte';
	import dtb, { supabase } from '$lib/dtb';

	let unsubscribe = page.subscribe(async (value) => {
		store.project_id = +value.params.project_id;

		store.write_access.set(await dtb.check_write_access());
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<slot></slot>
