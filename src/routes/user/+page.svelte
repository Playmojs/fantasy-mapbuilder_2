<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
	import Homebar from '../../components/Homebar.svelte';
	import dtb from '../../lib/dtb';
	import { store } from '../../store.svelte';
</script>

<main>
	<Homebar />
	<h1>Work in Progress</h1>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		width: 100%;
	}
	h1 {
		position: relative;
		color: var(--main_white);
		margin-left: auto;
		margin-right: auto;
		top: 100px;
	}
</style>
