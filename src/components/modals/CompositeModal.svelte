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
	</div>	
{/if}
<div id='current_modal'>
    <Modal close={close} modal={current_modal} window_rect={modal_rect}/>
</div>



<style>
	#modal_head{
		display: flex;
		justify-content: start;
		gap: 50%;
		height: 40px;
		margin-bottom: 15px;
		margin-right: 25px;
	}

	.tab_row {
		display: flex;
		justify-content: start;
		align-items: center;
		gap: var(--space-xs);
	}

	.tab {
		height: 40px;
		width: fit-content;
		border-radius: var(--radius-xs);
		background-color: var(--color-border);
		color: var(--color-text-primary);
		font-size: x-large;
		box-shadow: var(--shadow-md);
	}

	.current_tab {
		background-color: var(--color-panel);
		box-shadow: none;
	}
</style>
