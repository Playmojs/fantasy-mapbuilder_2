<script lang="ts">
	import { onMount } from 'svelte';
	import type { UploadModalData, UploadModalInput } from '$lib/types';
	
	let {modal_data, close, on_close} : {modal_data: UploadModalData<any>, close: () => void, on_close?: (success: boolean) => void} = $props()
	
	let state = $state(modal_data.initial_state || {});
	const update_state = (key: string, value: any) => {
	  state = { ...state, [key]: value };
	};
  
	const handle_submit = async () => {
	  if (!modal_data.validation_func(state)) return;
	  await modal_data.submit_func(state);
	  on_close?.(true);
	  close();
	};
  
	const determinePreview = () => {
	  return modal_data.determine_preview ? modal_data.determine_preview(state) : null;
	};

  </script>

<div id="upload_modal">
	<form on:submit|preventDefault={handle_submit}>
	  {#each modal_data.inputs as input}
		{#if input.type === 'text'}
		  <div class='text_field'>
			<label>{input.label}</label>
			<input
			  type="text"
			  placeholder={input.placeholder || ''}
			  value={state[input.name] || ''}
			  required={input.required}
			  on:input={(e) => {update_state(input.name, (e.target as HTMLInputElement).value)}}
			/>
		  </div>
		{/if}

		{#if input.type === 'number'}
		  <div class='text_field'>
			<label>{input.label}</label>
			<input
			  type="number"
			  placeholder={input.placeholder || ''}
			  value={state[input.name] || ''}
			  required={input.required}
			  on:input={(e) => {update_state(input.name, (e.target as HTMLInputElement).value)}}
			/>
			{#if input.unit}
				<select id='select_unit' name='units' on:change={(event: any) => {if(input.unit)input.unit.on_click(state, event.target?.value)}}>
					{#each input.unit.units as unit}
						<option value={unit.id}>{unit.name}</option>
					{/each}
				</select>
			{/if}
		  </div>
		{/if}
  
		{#if input.type === 'file'}
		  <div>
			<input
			  type="file"
			  min='1'
			  step='1'
			  on:change={(e) => {update_state(input.name, (e.target as HTMLInputElement).files?.[0] || null)}}
			  required={input.required}
			/>
		  </div>
		{/if}
  
		{#if input.type === 'button'}
		  <div on:click={()=> input.on_click(state)}>
			<button
			  type="button"
			  on:click={() => input.on_click(state)}
			>{input.label}</button>
			<p class='button_description'>{input.display_text ? input.display_text(state) : ''}</p>
		  </div>
		{/if}
	  {/each}
  
	  <button type="submit" disabled={!modal_data.validation_func(state)}>
		{modal_data.button_title}
	  </button>
	</form>
  
	<div id="preview">
	  {#if determinePreview()}
		<img src={determinePreview()} alt="Preview" />
	  {:else}
		<p>No preview available</p>
	  {/if}
	</div>
  </div>



<style>
	#upload_modal{
		position: relative;
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	form {
		position: relative;
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
	
	form > div{
		position: relative;
		display: flex;
		align-items: center;
		background-color: rgb(60, 60, 60);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		width: 90%;
		height: 40px;
		padding: 10px;
		gap: 10px;
	}

	label {
		position: relative;
		font-size: 1.4rem;
		margin: 0px 30px 0px 10px;
		color: var(--main_white);
		flex: 0 0 10%;
	}

	input[type=text] {
		position: relative;
		background-color: rgb(130, 130, 130);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		padding: 10px 0px 10px 15px;
		width: 90%;
		font-size: large;
	}

	input[type=number] {
		position: relative;
		background-color: rgb(130, 130, 130);
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		padding: 10px 0px 10px 15px;
		width: 70%;
		font-size: large;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='file'] {
		position: relative;
		width: 100%;
		color: var(--main_white);
		font-family: 'Cormorant Garamond';
		font-size: 1.4rem;
	}

	input[type='file']::file-selector-button{
		font-family: 'Cormorant Garamond';
		border-radius: 5px;
		font-size: 1.2rem;
		padding: 7px 10px;
		margin-right: 50px;
		width: 40%;
		background-color: rgb(130, 130, 130);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	button[type='button']{
		position: relative;
		font-family: 'Cormorant Garamond';
		border-radius: 5px;
		font-size: 1.2rem;
		padding: 7px 10px;
		margin-right: 50px;
		width: 40%;
		background-color: rgb(130, 130, 130);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	.button_description{
		color: var(--main_white);
		font-family: 'Cormorant Garamond';
		font-size: 1.4rem;
	}


	button[type='submit']{
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

	button[type='submit']:disabled {
		background-color: rgb(80, 80, 80);
		box-shadow: none;
		cursor: not-allowed;
		border: none;
		color: black;
	}

	select{
		position: relative;
		flex: 0 0 15%;
		height: 100%;
		border-radius: 10px;
		background-color: rgb(130, 130, 130);
		font-size: 1.2rem;
	}

	#preview {
		position: relative;
		width: 50%;
	}

	#preview > img {
		display: block;
		height: auto;
		max-width: 100%;
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(10, 10, 10);
	}

	#preview > p{
		color: var(--main_white);
		font-size: 1.5rem;
		text-align: center;
	}
</style>
