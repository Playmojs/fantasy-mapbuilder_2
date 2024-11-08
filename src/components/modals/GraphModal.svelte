<script lang="ts">
	import { type GraphModalData, type ModalEntity } from '$lib/types';
	import { store } from '../../store.svelte';
	import GraphNode from '../GraphNode.svelte';
	import ZoomPan from '../ZoomPan.svelte';

	let{close, modal_data, on_close, use_search}:{close: any, modal_data: GraphModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean} = $props()

</script>

<div id="graph">
	<GraphNode id={store.project_cache[store.project_id].head_map_id} graph_entities={modal_data.graph_entities}/>
	<ZoomPan parent_selector='#graph' transform={{x: 0, y: 0, scale: 1}} offset_limit={{x: 0, y: 0, width: 1000, height: 1000}}/>
</div>

<style>
	#graph {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		width: 100%;
		overflow-x: visible;
		scrollbar-color: transparent;
		padding: 0% 50% 50% 0%;
	}

	#graph::-webkit-scrollbar{
		display: none;
	}

	.node {
		margin-top: 0.5rem;
	}

	.label {
		cursor: pointer;
		font-weight: bold;
	}
</style>
