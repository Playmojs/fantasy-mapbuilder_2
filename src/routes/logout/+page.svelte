<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/dtb';
	import { assert_unreachable } from '$lib/utils';
	import { store } from '../../store.svelte';

	if (store.user === null) {
		goto('/');
	}

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			assert_unreachable('Unable to log out');
		}
		store.user = null;
		goto('/');
	};

	logout();
</script>
