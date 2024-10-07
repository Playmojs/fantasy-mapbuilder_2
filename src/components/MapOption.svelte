<script lang="ts">
	import type { ModalData } from '$lib/types';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { store } from '../store.svelte';
	import EntityGrid from './EntityGrid.svelte';
	import dtb, { supabase } from '$lib/dtb';
	import { gotoMap } from '$lib/goto_map';
	import { assert_unreachable } from '$lib/utils';
	
	function update_title(){
		if (!title_input){return}
		map_title = title_input.value;
	}

	function close(){
		if(file_input){
			file_input.files = null;
			file_input.value = '';
	}
		store.edit_map_window = null;
	}

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};

	const handle_submit= async () => {
		if (!store.edit_map_window || !store.edit_map_window.validation_func(file, map_title)) {
			assert_unreachable("Error trying to submit image")
			close()
			return;
		}
		store.edit_map_window.submit_func(file instanceof File ? file : null, map_title);
		store.edit_map_window = null;
		close()
	}

	const handle_file_change = () => {
		file = file_input.files?.[0] ?? (!store.edit_map_window?.allow_no_file ? store.edit_map_window?.initial_image_blob ?? null : null)
	};

	let title_input: HTMLInputElement;
	let file_input: HTMLInputElement;
	let map_title = $state<string>('')

	let file = $state<File | Blob | null>(store.edit_map_window?.initial_image_blob?? null);
	let file_preview = $derived<string | null>(file !== null? URL.createObjectURL(file):null);

	$effect(()=> {file = store.edit_map_window?.initial_image_blob?? null;
		map_title = store.edit_map_window?.initial_map_title ?? ""})
</script>

<div class="modal" on:click={handleClose} class:hidden={store.edit_map_window === null}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		<form id="form" on:submit|preventDefault={handle_submit}>
			{#if store.edit_map_window?.initial_map_title !== null}
				<div id='title'>
					<label id='title_label'>Map Title: </label>
					<input id="title_input" value={map_title} bind:this={title_input} on:keyup={() => {update_title()}} required/>
				</div>
			{/if}
			<input
				class="map_file"
				type="file"
				id="fileInput"
				accept="image/*"
				on:change={handle_file_change}
				bind:this={file_input}
			/>
			<button disabled={!store.edit_map_window?.validation_func(file, map_title)} type="submit" class="execute_button">{store.edit_map_window?.button_title}
			</button>
		</form>
		<div id="image-preview-section">
			{#if file_preview}
				<img src={file_preview} alt="Image Preview" class="image-preview" />
			{:else}
				<p class="no-image">No image selected</p>
			{/if}
		</div>
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
		height: 60%;
		overflow-y: hidden;
		border-radius: 5px;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	#form{
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		height: 100%;
		width: 40%;
		align-items: center;
	}

	#title_label {
		font-size: x-large;
		margin-right: 15px;
		color: white;
	}

	#title_input {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		color: black;
		background-color: rgb(120, 120, 120);
		font-size: large;
		width: 60%;
		text-align: center;
		border-radius: 5px;
	}

	.map_file {
		position: relative;
		margin-left: 10%;
		width: 60%;
		color: white;
		font-size: 1rem;
	}
	.execute_button {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		background-color: rgb(80, 80, 80);
		cursor:pointer;
		height: fit-content;
		width: 40%;
		font-size: large;
		color: white;
		border-radius: 10%;
	}

	.execute_button:disabled{
		cursor:not-allowed;
		border: none;
		color: black;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: white;
	}
	#title{
		font-size: large;
		font-family: 'Cormorant Garamond', serif;
	}

	#image-preview-section{
		position: relative;
		width: 50%;
	}

	.image-preview{
		display: block;
		height: auto;
		max-width: 100%;
		border-radius: 10px;
	}

	.no-image{
		color: white;
		font-size: 1.5rem;
		text-align: center;
	}
</style>
