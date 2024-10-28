<script lang="ts">
	import type { ChooseModalData, ModalEntity } from '$lib/types';
	import { untrack } from 'svelte';
	import { store } from '../store.svelte';
	import EntityGrid from './EntityGrid.svelte';
	import SearchInput from './SearchInput.svelte';

	let {
		modal_data,
		close,
		on_close,
		use_search,
	}: {
		modal_data: ChooseModalData;
		close: any;
		on_close: ((success: boolean, result?: any) => void) | undefined;
		use_search: boolean
	} = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};

	let current_tab = $state<string>(Object.keys(modal_data)[0]);
	
	let search_output = $state<ModalEntity[]>([]);
	let current_entities = $derived<ModalEntity[]>(use_search ? search_output : modal_data[current_tab])

	$effect(() => {
		current_tab = Object.keys(modal_data)[0];
	});
</script>

<div class="modal" on:click={handleClose} class:hidden={!modal_data}>
	<div class="modal-content" on:click|stopPropagation>
		{#if modal_data}
			<div id=modal_head>
				<div class="tab_row">
					{#each Object.keys(modal_data) as tab}
						<button
							class="tab"
							class:current_tab={tab === current_tab}
							disabled={tab === current_tab}
							on:click={() => {
								current_tab = tab;
							}}><strong>{tab}</strong></button
						>
					{/each}
				</div>
				<SearchInput searchDomain={modal_data[current_tab]} bind:filtered={search_output}/>
			</div>	
		{/if}
		<span class="close" on:click={handleClose}>&times;</span>
		{#if current_entities}
			<EntityGrid modal_entities={current_entities} {close} {on_close} />
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
		background: rgb(60, 60, 60);
		width: 80%;
		max-width: 1000px;
		max-height: 80%;
		overflow-y: hidden;
		border-radius: 5px;
		border: 3px ridge var(--main_gold);
	}

	#modal_head{
		display: flex;
		justify-content: space-around;
		gap: 50%;
		height: 40px;
		margin-bottom: 15px;
		margin-right: 25px;
	}

	.tab_row {
		display: flex;
		justify-content: start;
		align-items: center;
		gap: 1px;
	}

	.tab {
		height: 40px;
		width: 100px;
		border-radius: 5px;
		background-color: rgb(80, 80, 80);
		color: var(--main_white);
		font-size: x-large;
		box-shadow: 5px 5px 5px rgb(40, 40, 40)
	}

	.current_tab {
		background-color: rgb(55, 55, 55);
		box-shadow: none;
	}
	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: var(--main_white);
	}
</style>
