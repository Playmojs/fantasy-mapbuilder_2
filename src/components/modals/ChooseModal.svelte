<script lang="ts">
	import { type ChooseModalData, type ModalEntity } from '$lib/types';
	import { store } from '../../store.svelte';
	import SearchInput from '../SearchInput.svelte';
	import Modal from './Modal.svelte';

	let{close, modal_data, on_close, use_search}:{close: any, modal_data: ChooseModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean} = $props()

	async function handle_entity_click(entity: ModalEntity) {
		await entity.on_click();
		if(!on_close){close(); return;}
		else{on_close(true);}
		close()
	}

	const min_width = store.mobile_layout ? 20 : 200;

	let current_tab = $state<string>(Object.keys(modal_data)[0]);
	
	let search_output = $state<ModalEntity[]>([]);
	let current_entities = $derived<ModalEntity[]>(use_search ? search_output : modal_data[current_tab])

	$effect(() => {
		current_tab = Object.keys(modal_data)[0];
	});

</script>

<div id=choose_modal>
	<div id=modal_head>
		<div id="tab_row">
			{#each Object.keys(modal_data) as tab}
				<button
					class="tab"
					class:disabled={tab === current_tab}
					class:only_tab={Object.keys(modal_data).length === 1}
					disabled={tab === current_tab}
					onclick={() => {
						current_tab = tab;
					}}><p class="tab_text">{tab}</p></button
				>
			{/each}
		</div>
		{#if use_search}
			<div id='search_wrapper'>
				<SearchInput searchDomain={modal_data[current_tab]} bind:filtered={search_output}/>
			</div>
		{/if}
	</div>
{#if current_entities}
	<div id="grid-container">
		<div id="grid">
			{#each current_entities as entity}
				<div
					class="entity-item"
					title={entity.title}
					onclick={() => {
						handle_entity_click(entity);
					}}
						style={entity.background_image ? `background-image: url("${entity.background_image}");`: '' + `grid-template-columns: repeat(auto-fill, minmax(${min_width}px, 1fr)`}
					>

					{#if entity.image !== null}
					<div class="image-container">
						<img class="entity-image" src={entity.image} alt={entity.title}/>
					</div>
					{/if}
					<div class='title_row'>
						<p>{entity.title}</p>
						{#if entity.optional_func}
							<button class='option_button' onclick={(e: Event)=>{if(entity.optional_func)entity.optional_func(); e.stopPropagation();}}>
							</button>	
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
</div>



<style>
	#choose_modal{
		display: flex;
		flex-direction: column;
	}

	#modal_head{
	 	position: relative;
		display: flex;
		gap: var(--space-sm);
		height: 50px;
		flex-shrink: 0;
	}

	#tab_row {
		display: flex;
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
		gap: var(--space-sm);
	}

	#tab_row button{
		position: relative;
		aspect-ratio: 4/3; 
		height: 80%;
		border: none;
		cursor: pointer;
		color: var(--color-text-primary);

		background-size: contain;
		background-position: center center;
		background-color: var(--color-panel);
		border-radius: var(--radius-d);
		background-repeat: no-repeat;
		box-shadow: var(--shadow-sm);
	}

	#tab_row button:active{
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	.tab{
		width: 150px;
		flex-shrink: 1;
		min-width: 100px;
		display: flex;
		align-items: center;
		font-size: large;

		background-color: var(--color-panel);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		border: none;
	}

	#tab_row > button:disabled{
		background-color: var(--color-bg-primary);
		cursor: default;
		box-shadow: none;
	}

	.only_tab{
		background-color: transparent;
		border: none;
	}

	.tab_text{
		position: relative;
		flex: 1;

		text-align: left;
		margin-left: var(--space-md);

		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	#search_wrapper{
		width: 30%;
	}

	#grid-container {
		flex: 1 1 65vh;
		overflow-y: auto;
		padding: var(--space-md) var(--space-md) var(--space-xl);
		background-color: var(--color-border-light);
		border-radius: var(--radius-xl);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
	}
	
	#grid {
		display: grid;
		justify-content: space-around;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.entity-item {
		position: relative;
		cursor: pointer;
		text-align: center;
		background-color: var(--color-panel);
		box-shadow: var(--shadow-md);
		padding: var(--space-sm) var(--space-sm);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		background-position: top right;
        background-size: 100%;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 150px;
		overflow: hidden;
		margin-bottom: var(--space-sm);
	}
	
	.entity-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
	}

	.title_row {
		display: flex;
		width: 100%;
		justify-content: end;
	}

	.title_row p {
		color: var(--color-text-primary);
		font-family: 'Cormorant Garamond';
		font-size: x-large;
		text-align: left;

		flex: 1;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap; 
	}
	
	.option_button {
		position: relative;
		flex: 0 0 30px;
		aspect-ratio: 1;
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

	#grid-container::-webkit-scrollbar {
		width: 12px;
	}

	#grid-container::-webkit-scrollbar-track {
		background: var(--color-bg-primary);
		border-radius: var(--radius-md);
	}

	#grid-container::-webkit-scrollbar-thumb {
		background-color: var(--color-bg-secondary);
	}

	#grid-container::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-bg-tertiary);
	}

	@media(max-width: 768px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(120px, 0.5fr));
			grid-auto-rows: 120px;
		}
	}

	@media (max-height: 700px) {
	#grid {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}}
</style>
