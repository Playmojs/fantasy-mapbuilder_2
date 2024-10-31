<script lang="ts">
	import { type ChooseModalData, type ModalEntity } from '$lib/types';
	import SearchInput from '../SearchInput.svelte';

	let{close, modal_data, on_close, use_search}:{close: any, modal_data: ChooseModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean} = $props()

	async function handle_entity_click(entity: ModalEntity) {
		await entity.on_click();
		if(!on_close){close(); return;}
		else{on_close(true);}
		close()
	}

	let current_tab = $state<string>(Object.keys(modal_data)[0]);
	
	let search_output = $state<ModalEntity[]>([]);
	let current_entities = $derived<ModalEntity[]>(use_search ? search_output : modal_data[current_tab])

	$effect(() => {
		current_tab = Object.keys(modal_data)[0];
	});

</script>

{#if modal_data}
	<div id=modal_head>
		<div class="tab_row">
			{#each Object.keys(modal_data) as tab}
				<button
					class="tab"
					class:current_tab={tab === current_tab}
					disabled={tab === current_tab}
					onclick={() => {
						current_tab = tab;
					}}><strong>{tab}</strong></button
				>
			{/each}
		</div>
		<SearchInput searchDomain={modal_data[current_tab]} bind:filtered={search_output}/>
	</div>	
{/if}
{#if current_entities}
	<div id="grid-container">
		<div id="grid">
			{#each current_entities as entity}
				<div
					class="entity-item"
					onclick={() => {
						handle_entity_click(entity);
					}}
				>
					{#if entity.optional_func}
						<button class='option_button' onclick={(e: Event)=>{if(entity.optional_func)entity.optional_func(); e.stopPropagation();}}>
						</button>	
					{/if}
					{#if entity.image !== null}
						<div class="image-container">
							<img class="entity-image" src={entity.image} alt={entity.title} />
						</div>
					{/if}
					<p>{entity.title}</p>
				</div>
			{/each}
		</div>
	</div>
{/if}



<style>
	

	#modal_head{
		display: flex;
		justify-content: space-around;
		gap: 50%;
		height: 40px;
		margin-bottom: 30px;
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
		width: fit-content;
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

	#grid-container {
		max-height: calc(100vh - 300px);
		overflow-y: scroll;
		padding: 15px 15px 30px;
		background-color: rgb(100, 100, 100);
		border-radius: 15px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}

	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}

	.entity-item {
		position: relative;
		cursor: pointer;
		text-align: center;
		background-color: rgb(50, 50, 50);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		padding: 10px 10px;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
	}

	.option_button {
		position: absolute;
		top: 10px;
		width: 30px;
		right: 10px;
		aspect-ratio: 0.5;
		background-color: transparent;
		background-image: url('/assets/more_vert.png');
		background-size: contain;
		background-repeat: no-repeat;
		border: none;
		cursor: pointer;
	}

	.option_button:hover{
		opacity: 0.7;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 150px;
		overflow: hidden;
		margin-bottom: 10px;
	}

	.entity-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
	}

	.entity-item p {
		color: var(--main_white);
		font-family: 'Cormorant Garamond';
		font-size: x-large;
		margin: 0;
	}

	#grid-container::-webkit-scrollbar {
		width: 12px;
	}

	#grid-container::-webkit-scrollbar-track {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#grid-container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#grid-container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}
</style>
