<script lang="ts">
	import type {ModalType } from '$lib/types';
	import Modal from './Modal.svelte';

	let {
		close,
		modal
	}: {
		close: any;
		modal: ModalType;
	} = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};
</script>

<div class="modal" on:click={handleClose}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		<Modal close={close} modal={modal}/>
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
