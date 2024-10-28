<script lang="ts">
	import { pop_modal } from '$lib/modal_manager';
	import { type CompositeModalData, type Modal, type ModalEntity } from '$lib/types';
	import ChooseModal from './ChooseModal.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import SearchInput from './SearchInput.svelte';
	import UploadModal from './UploadModal.svelte';

	let{close, modal_data, on_close}:{close: any, modal_data: CompositeModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined} = $props()

	async function handle_entity_click(entity: ModalEntity) {
		await entity.on_click();
		if (on_close){on_close(true);}
		close()
	}

	let current_tab = $state<string>(Object.keys(modal_data)[0]);
    let current_modal = $derived<Modal>(modal_data[current_tab])

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
					on:click={() => {
						current_tab = tab;
					}}><strong>{tab}</strong></button
				>
			{/each}
		</div>
	</div>	
{/if}
<div id='current_modal'>
    {#if current_modal.type === 'upload_modal'}
    <UploadModal
            modal_data={current_modal.data}
            close={() => {
                pop_modal();
            }}
            on_close={current_modal.on_close}
        />
    {:else if current_modal.type === 'confirm_modal'}
        <ConfirmModal
            modal_data={current_modal.data}
            close={() => {
                pop_modal();
            }}
        />
    {:else if current_modal.type === 'choose_modal'}
        <ChooseModal
            modal_data={current_modal.data}
            close={() => {
                pop_modal();
            }}
            on_close={current_modal.on_close}
            use_search={current_modal.use_search}
        />
    {/if}
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
		gap: 5px;
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
</style>
