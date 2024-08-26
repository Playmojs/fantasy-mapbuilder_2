<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/dtb';
	import { assert_unreachable } from '$lib/utils';

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			assert_unreachable('Unable to log out');
		}
		goto('/');
	};

	logout();
</script>
