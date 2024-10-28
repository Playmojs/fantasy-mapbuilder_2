<script lang="ts">
	import type {Modal } from '$lib/types';
	import { pop_modal } from '$lib/modal_manager';
	import ConfirmModal from './ConfirmModal.svelte';
	import ChooseModal from './ChooseModal.svelte';
	import UploadModal from './UploadModal.svelte';
	import CompositeModal from './CompositeModal.svelte';

	let {
		close,
		modal
	}: {
		close: any;
		modal: Modal;
	} = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};
</script>

<div class="modal" on:click={handleClose}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		{#if modal.type === 'upload_modal'}
		<UploadModal
				modal_data={modal.data}
				close={() => {
					pop_modal();
				}}
				on_close={modal.on_close}
			/>
		{:else if modal.type === 'confirm_modal'}
			<ConfirmModal
				modal_data={modal.data}
				close={() => {
					pop_modal();
				}}
			/>
		{:else if modal.type === 'choose_modal'}
			<ChooseModal
				modal_data={modal.data}
				close={() => {
					pop_modal();
				}}
				on_close={modal.on_close}
				use_search={modal.use_search}
			/>
		{:else if modal.type === 'composite_modal'}
			<CompositeModal
				modal_data={modal.data}
				close={() => {
					pop_modal();
				}}
				on_close={modal.on_close}
			/>
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

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: var(--main_white);
	}

	.modal-content {
		position: relative;
		margin: 5% auto;
		padding: 20px;
		background: rgb(60, 60, 60);
		width: 80%;
		max-width: 1000px;
		max-height: 80%;
		overflow-y: hidden;
		border-radius: 5px;
		border: 3px ridge var(--main_gold);
	}
</style>
