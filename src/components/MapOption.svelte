<script lang="ts">
	import type { ModalData } from '$lib/types';
	import { untrack } from 'svelte';
	import { store } from '../store.svelte';
	import EntityGrid from './EntityGrid.svelte';
	import dtb, { supabase } from '$lib/dtb';
	import { gotoMap } from '$lib/goto_map';

	let map_title: HTMLHeadElement;
	let { close }: { close: any } = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};
	let title = $state<string>('Title');
	let file = $state<File | null>(null);
</script>

<div class="modal" on:click={handleClose} class:hidden={store.edit_map_window === null}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		<div id="map_title">
			<h1 bind:this={map_title} contenteditable="true">{title}</h1>
		</div>
		<input
			class="input"
			type="file"
			id="fileInput"
			on:change={(e) => (file = (e.target as HTMLInputElement).files?.[0] || null)}
		/>
		<button
			class="execute_button"
			on:click={async () => {
				if (!store.edit_map_window || file === null) {
					return;
				}
				store.edit_map_window.func(file, map_title.innerText);
				store.edit_map_window = null;
			}}
			disabled={file === null}>{store.edit_map_window?.button_title}</button
		>
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
		height: 40%;
		overflow-y: hidden;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-content: center;
	}

	#map_title {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		color: white;
		font-size: x-large;
		width: 60%;
		text-align: center;
	}

	.input {
		position: relative;
		margin-left: 10%;
		width: 40%;
	}
	.execute_button {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		background-color: rgb(80, 80, 80);
		border: none;
		height: 10%;
		width: 40%;
		font-size: large;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: white;
	}

	h1 {
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
	}
</style>
