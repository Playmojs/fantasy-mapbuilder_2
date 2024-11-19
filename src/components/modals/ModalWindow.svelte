<script lang="ts">
	import type {ModalType } from '$lib/types';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';

	let {
		close,
		modal
	}: {
		close: any;
		modal: ModalType;
	} = $props();

	let modal_window: HTMLDivElement;
	let rect = $state<DOMRect>({height: 0, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => {}});

	function set_window_rect(){
		rect = modal_window?.getBoundingClientRect();
	}

	onMount(()=> {
		window.addEventListener('resize', set_window_rect);
		set_window_rect();
	})

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};
</script>

<div class="modal" on:click={handleClose}>
	<div class="modal-content" bind:this={modal_window} on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		<Modal close={close} modal={modal} window_rect={rect}/>
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
		max-height: 80%;
		overflow-y: hidden;
		overflow-x: hidden;
		border-radius: 5px;
		border: 3px ridge var(--main_gold);
	}
</style>
