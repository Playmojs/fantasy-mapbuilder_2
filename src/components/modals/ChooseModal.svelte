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
		<div class="tab_row">
			{#each Object.keys(modal_data) as tab}
				<button
					class="tab"
					class:current_tab={tab === current_tab}
					class:only_tab={Object.keys(modal_data).length === 1}
					disabled={tab === current_tab}
					onclick={() => {
						current_tab = tab;
					}}><strong>{tab}</strong></button
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
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	#modal_head{
		display: flex;
		justify-content: space-around;
		gap: 10%;
		flex: 0 0 auto;
		margin-bottom: 2%;
	}

	.tab_row {
		display: flex;
		justify-content: start;
		align-items: center;
		gap: 1px;
		flex: 1;
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

	.only_tab{
		background-color: transparent;
		border: none;
	}

	#search_wrapper{
		width: 50%;
	}

	#grid-container {
		flex: 1 1 65vh;
		overflow-y: auto;
		padding: 15px 15px 30px;
		background-color: rgb(100, 100, 100);
		border-radius: 15px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}
	
	#grid {
		display: grid;
		justify-content: space-around;
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
		background-position: top right;
        background-size: 100%;
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

	.title_row {
		display: flex;
		width: 100%;
		justify-content: end;
	}

	.title_row p {
		color: var(--main_white);
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
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#grid-container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#grid-container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	@media(max-width: 768px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(120px, 0.5fr));
			grid-auto-rows: 120px;
		}
	}
</style>
