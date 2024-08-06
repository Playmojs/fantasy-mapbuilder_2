<script lang="ts">
	import type { ModalData } from '$lib/types';
	import { store } from '../store.svelte';
	import EntityGrid from './EntityGrid.svelte';
	export let modal_data: ModalData | null = null;
	export let close;

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};
</script>

<div class="modal" on:click={handleClose} class:hidden={!store.modal_data}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		{#if modal_data}
			<EntityGrid modal_entities={modal_data.entities} />
		{/if}
	</div>
</div>

<style>
	.modal {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.modal.hidden {
		display: none;
	}

	.modal-content {
		position: relative;
		margin: 5% auto;
		padding: 20px;
		background: rgb(47, 47, 47);
		width: 80%;
		max-width: 800px;
		max-height: 80%;
		overflow-y: hidden;
		border-radius: 5px;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: white;
	}
</style>
