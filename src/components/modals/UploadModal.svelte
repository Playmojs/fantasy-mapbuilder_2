<script lang="ts">
	import "../../lib/styles/button.css"
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
			  class = "btn"
			  type="button"
			  on:click={() => input.on_click(state)}
			>{input.label}</button>
			<p class='button_description'>{input.display_text ? input.display_text(state) : ''}</p>
		  </div>
		{/if}
	  {/each}
  
	  <button class="btn-primary" type="submit" disabled={!modal_data.validation_func(state)}>
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
		gap: var(--space-2xl);
		height: 100%;
		width: 40%;
		align-items: center;
		padding:  var(--space-2xl) var(--space-lg) var(--space-xl) var(--space-lg);
		background-color: rgb(90, 90, 90);
		border-radius: var(--space-md);
		box-shadow: inset var(--shadow-md);
	}
	
	form > div{
		position: relative;
		display: flex;
		align-items: center;
		background-color: var(--color-panel);
		border-radius: var(--space-sm);
		box-shadow: var(--shadow-md);
		width: 90%;
		height: 40px;
		padding:  var(--space-sm);
		gap:  var(--space-sm);
	}

	label {
		position: relative;
		font-size: 1.4rem;
		margin: 0px var(--space-xl) 0px var(--space-sm);
		color: var(--color-text-primary);
		flex: 0 0 10%;
	}

	input[type=text] {
		position: relative;
		background-color: rgb(130, 130, 130);
		border-radius: var(--space-sm);
		box-shadow: var(--shadow-md);
		padding: var(--space-sm) 0px var(--space-sm) var(--space-md);
		width: 90%;
		font-size: large;
	}

	input[type=number] {
		position: relative;
		background-color: rgb(130, 130, 130);
		border-radius: var(--space-sm);
		box-shadow: var(--shadow-md);
		padding: var(--space-sm) 0px var(--space-sm) var(--space-md);
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
		color: var(--color-text-primary);
		font-family: 'Cormorant Garamond';
		font-size: 1.4rem;
	}

	input[type='file']::file-selector-button{
		font-family: 'Cormorant Garamond';
		width: 40%;
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xs) var(--space-lg);
		margin: var(--space-md) var(--space-2xl) var(--space-md) 0; 
		border: none;
		border-radius: var(--radius-sm);
		background: linear-gradient(135deg, var(--color-panel) 0%, var(--color-bg-tertiary) 100%);
		color: var(--color-text-primary);
		font-weight: 600;
		line-height: 1.5;
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		overflow: hidden;
		text-decoration: none;
		user-select: none;
		font-size: 1.2rem;
	}

	
	/* Shine effect on hover */
	input[type='file']::file-selector-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(
		90deg,
		transparent,
		rgba(255, 255, 255, 0.1),
		transparent
	);
	transition: left var(--transition-slow);
	}

	input[type='file']::file-selector-button:hover::before {
	left: 100%;
	}

	input[type='file']::file-selector-button:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 4px 8px rgba(0, 0, 0, 0.4),
		inset 0 1px 0 rgba(255, 255, 255, 0.15);
	background: linear-gradient(135deg, var(--color-panel-hover) 0%, var(--color-bg-tertiary) 100%);
	}

	input[type='file']::file-selector-button:active {
	transform: translateY(0);
	box-shadow: 
		0 1px 2px rgba(0, 0, 0, 0.3),
		inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	button[type='button']{
		position: relative;
		font-family: 'Cormorant Garamond';
		border-radius: var(--radius-sm);
		font-size: 1.2rem;
		padding: var(--space-xs) var(--space-sm);
		margin-right: var(--space-2xl);
		width: 40%;
		background-color: rgb(130, 130, 130);
		box-shadow: var(--shadow-md);
	}

	.button_description{
		color: var(--color-text-primary);
		font-family: 'Cormorant Garamond';
		font-size: 1.4rem;
	}


	button[type='submit']{
		position: relative;
		margin-left: auto;
		margin-right: auto;
		background-color: var(--color-panel);
		cursor: pointer;
		height: fit-content;
		padding: var(--space-md) 0px;
		width: 60%;
		font-size: large;
		color: var(--color-text-primary);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
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
		border-radius: var(--radius-md);
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
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}

	#preview > p{
		color: var(--color-text-primary);
		font-size: 1.5rem;
		text-align: center;
	}
</style>
