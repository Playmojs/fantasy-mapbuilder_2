<script lang="ts">
	import { type CompositeModalData, type ModalType, type ModalEntity } from '$lib/types';
	import Modal from './Modal.svelte';

	let{close, modal_data, on_close, window_rect}:{close: any, modal_data: CompositeModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, window_rect: DOMRect} = $props()

	async function handle_entity_click(entity: ModalEntity) {
		await entity.on_click();
		if (on_close){on_close(true);}
		close()
	}

	let modal_head: HTMLDivElement;
	function modal_head_size(){
		return (modal_head.getBoundingClientRect())
	}

	let modal_rect = $derived.by(() => {const head_size = modal_head_size(); return {...window_rect, y: window_rect.y - head_size.height, height: window_rect.height - head_size.height, top: window_rect.top - head_size.top} })

	let current_tab = $state<string>(Object.keys(modal_data)[0]);
    let current_modal = $derived<ModalType>(modal_data[current_tab])

</script>


<div id=composite_modal>
	{#if modal_data}
		<div id=modal_head>
			<div id="tab_row">
				{#each Object.keys(modal_data) as tab}
					<button
						class="tab"
						disabled={tab === current_tab}
						onclick={() => {
							current_tab = tab;
						}}><p class="tab_text">{tab}</p></button>
				{/each}
			</div>
		</div>	
	{/if}
	<div id='current_modal'>
		<Modal close={close} modal={current_modal} window_rect={modal_rect}/>
	</div>
</div>


<style>
	#composite_modal{
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

	#tab_row button:disabled{
		background-color: var(--color-bg-primary);
		cursor: default;
		box-shadow: none;
	}
</style>
