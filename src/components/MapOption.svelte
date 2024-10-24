<script lang="ts">
	import type { UploadModalData } from '$lib/types';
	import { store } from '../store.svelte';
	import { assert_unreachable } from '$lib/utils';

	let button: HTMLButtonElement;

	let {
		modal_data,
		close,
		on_close
	}: {
		modal_data: UploadModalData<any>;
		close: any;
		on_close: ((success: boolean, result?: any) => void) | undefined;
	} = $props();

	function update_title() {
		if (!title_input) {
			return;
		}
		map_title = title_input.value;
	}

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};

	const handle_submit = async () => {
		if (!modal_data.validation_func(file, map_title, link_id)) {
			assert_unreachable('Error trying to submit image');
			close();
			return;
		}
		const result = modal_data.submit_func(file instanceof File ? file : null, map_title, link_id);
		if (on_close !== undefined && result !== undefined) {
			on_close(true, result);
		}
		close();
	};

	const handle_file_change = () => {
		file =
			file_input.files?.[0] ??
			(!modal_data.allow_no_file ? modal_data.initial_image_blob ?? null : null);
	};

	let title_input: HTMLInputElement;
	let file_input: HTMLInputElement;
	let map_title = $state<string>('');

	let file = $state<File | Blob | null>(modal_data.initial_image_blob ?? null);
	let file_preview = $derived<string | null>(file !== null ? URL.createObjectURL(file) : null);

	let link_id = $state<number | null>(modal_data.initial_link);
	$effect(() => {
		file = modal_data.initial_image_blob ?? null;
		map_title = modal_data.initial_map_title ?? '';
	});
</script>

<div class="modal" on:click={handleClose}>
	<div class="modal-content" on:click|stopPropagation>
		<span class="close" on:click={handleClose}>&times;</span>
		<form id="form" on:submit|preventDefault={handle_submit}>
			{#if modal_data?.initial_map_title !== null}
				<div id="title">
					<label id="title_label">Map Title: </label>
					<input
						id="title_input"
						value={map_title}
						bind:this={title_input}
						on:keyup={() => {
							update_title();
						}}
						required
					/>
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
			{#if modal_data.link_func !== null}
				<div id="link_row" on:click={() => {button.click()}}>
					<button
						id="link_button"
						type="button"
						bind:this={button}
						on:click|stopPropagation={async () => {
							if (modal_data.link_func) {
								link_id = (await modal_data.link_func()) ?? null;
							}
						}}>Link Article</button
					>
					<p id='link_title'>
						{`Article: ${typeof link_id === 'number' ? store.article_cache[link_id]?.title : 'unknown'}`}
					</p>
				</div>
			{/if}
			<button
				disabled={!modal_data.validation_func(file, map_title, link_id)}
				type="submit"
				class="execute_button"
				>{modal_data?.button_title}
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

	.modal-content {
		position: relative;
		margin: 5% auto;
		padding: 20px;
		background: rgb(47, 47, 47);
		width: 80%;
		max-width: 1000px;
		height: fit-content;
		top: 10%;
		overflow-y: hidden;
		border-radius: 5px;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	#form {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		gap: 50px;
		height: 100%;
		width: 40%;
		align-items: center;
		padding: 40px 20px 30px 20px;
		background-color: rgb(90, 90, 90);
		border-radius: 15px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}

	#title {
		background-color: rgb(60, 60, 60);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		padding: 10px 0px 10px 15px;
		width: 90%;
	}

	#title_label {
		font-size: x-large;
		margin-right: 15px;
		color: var(--main_white);
	}

	#title_input {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		color: black;
		font-family: 'Cormorant Garamond';
		background-color: rgb(140, 140, 140);
		font-size: 1.4rem;
		width: 50%;
		text-align: center;
		border-radius: 5px;
		box-shadow: inset 2px 2px 5px rgb(40, 40, 40);
	}

	.map_file {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		width: 90%;
		color: var(--main_white);
		font-family: 'Cormorant Garamond';
		font-size: 1.4rem;
		background-color: rgb(60, 60, 60);
		padding: 10px 0px 10px 15px;
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	.map_file::file-selector-button{
		font-family: 'Cormorant Garamond';
		border-radius: 5px;
		font-size: 1.2rem;
		margin-right: 15px;
		padding: 5px 15px;
		width: 40%;
		background-color: rgb(130, 130, 130);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	#link_row {
		position: relative;
		display: flex;
		justify-content: start;
		align-items: center;
		color: var(--main_white);
		width: 90%;
		font-size: 1.4rem;
		background-color: rgb(60, 60, 60);
		padding: 10px 0px 10px 15px;
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	#link_button {
		font-family: 'Cormorant Garamond';
		border-radius: 5px;
		font-size: 1.2rem;
		padding: 7px 15px;
		margin-right: 15px;
		width: 40%;
		background-color: rgb(130, 130, 130);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	#link_title{
		margin: 0px;
	}

	.execute_button {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		background-color: rgb(60, 60, 60);
		cursor: pointer;
		height: fit-content;
		padding: 15px 0px;
		width: 60%;
		font-size: large;
		color: var(--main_white);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	.execute_button:disabled {
		background-color: rgb(80, 80, 80);
		box-shadow: none;
		cursor: not-allowed;
		border: none;
		color: black;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: var(--main_white);
	}

	#title {
		font-size: 1.2rem;
		font-family: 'Cormorant Garamond', serif;
	}

	#image-preview-section {
		position: relative;
		width: 50%;
	}

	.image-preview {
		display: block;
		height: auto;
		max-width: 100%;
		border-radius: 10px;
	}

	.no-image {
		color: var(--main_white);
		font-size: 1.5rem;
		text-align: center;
	}
</style>
