<script lang="ts">
	import { type GraphModalData, type ModalEntity } from '$lib/types';
	import { onMount } from 'svelte';
	import { store } from '../../store.svelte';
	import GraphNode from '../GraphNode.svelte';
	import ZoomPan from '../ZoomPan.svelte';

	let{close, modal_data, on_close, use_search, window_rect}:{close: any, modal_data: GraphModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean, window_rect: DOMRect} = $props()

	let transform = $state({x: -20, y: -20, scale: 1});
	let offset_limit = $derived({x: -20, y: -20, width: window_rect.width, height: window_rect.height});
	let current_transform_state: {x: number, y: number, scale: number} = {x: 0, y: 0, scale: 1};
	let graph_element: any;
	
	
	function change_transform(x: number, y: number, scale?: number){
			transform.x = x;
			transform.y = y;
			transform.scale = scale ? scale : current_transform_state.scale;
			console.log(transform)
	}
	
	function on_zoompan(transf: {x: number, y: number, scale: number}){
		current_transform_state = transf;
	}

	function move_to_center(position: {x: number, y: number, width: number, height: number}, new_scale: number){
		const center_pos: {x: number, y: number} = {x: window_rect.width/2, y: window_rect.height/2}
		console.log(center_pos)
		const delta_scale = new_scale / current_transform_state.scale
		// change_transform(current_transform_state.x - position.x + center_pos.x, current_transform_state.y - position.y + center_pos.y);
		change_transform(window_rect.x + current_transform_state.x - position.x + center_pos.x - 0.5*position.width, window_rect.y + current_transform_state.y - position.y + center_pos.y - 0.5*position.height);
	}

	function on_toggle_node(previous_position: {x: number, y: number, width: number, height: number}, current_position: {x: number, y: number, width: number, height: number})
	{
		// change_transform(current_transform_state.x - current_position.x + previous_position.x, current_transform_state.y - current_position.y + previous_position.y)
		move_to_center(current_position, 0.8)

	}


	onMount(() => {
		const rect: DOMRect = graph_element.getBoundingClientRect();
		change_transform((rect.x - window_rect.x + 166) / 2, (rect.y - window_rect.y + 600) / 2)
	})

</script>

<div id="graph" bind:this={graph_element}>
	<GraphNode id={store.project_cache[store.project_id].head_map_id} graph_entities={modal_data.graph_entities} on_toggle={on_toggle_node}/>
	<ZoomPan parent_selector='#graph' transform={transform} offset_limit={offset_limit} scale_limit={null} on_zoompan={on_zoompan}/>
</div>

<style>
	#graph {
		position: relative;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: fit-content;
		overflow-x: visible;
		padding: 30% 50%;
		border: 5px solid white;
		user-select: none;
	}

</style>
