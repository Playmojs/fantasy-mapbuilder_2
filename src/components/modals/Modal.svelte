<script lang="ts">
	import type {ModalType } from '$lib/types';
	import { pop_modal } from '$lib/modal_manager.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import ChooseModal from './ChooseModal.svelte';
	import UploadModal from './UploadModal.svelte';
	import CompositeModal from './CompositeModal.svelte';
	import CategoryModal from './CategoryModal.svelte';
	import GraphModal from './GraphModal.svelte';
	import FilterModal from './FilterModal.svelte';

	let {
		close,
		modal = $bindable(),
		window_rect,
	}: {
		close: () => void;
		modal: ModalType;
		window_rect: DOMRect;
	} = $props();
</script>


{#if modal.type === 'upload_modal'}
	<UploadModal
		modal_data={modal.data}
		close={close}
		on_close={modal.on_close}
	/>
{:else if modal.type === 'confirm_modal'}
	<ConfirmModal
		modal_data={modal.data}
		close={close}
	/>
{:else if modal.type === 'choose_modal'}
	<ChooseModal
		modal_data={modal.data}
		close={close}
		on_close={modal.on_close}
		use_search={modal.use_search}
	/>
{:else if modal.type === 'composite_modal'}
	<CompositeModal
		modal_data={modal.data}
		close={close}
		on_close={modal.on_close}
		window_rect={window_rect}
	/>
{:else if modal.type === 'category_modal'}
	<CategoryModal
		data={modal.data}
	/>
{:else if modal.type === 'graph_modal'}
	<GraphModal
		close={close}
		modal_data={modal.data}
		on_close={modal.on_close}
		use_search={modal.use_search}
		window_rect={window_rect}
		/>
{:else if modal.type === 'filter_modal'}
	<FilterModal
		close={close}
		modal_data={modal.data}
		on_close={modal.on_close}
		use_search={modal.use_search}
	/>
{/if}