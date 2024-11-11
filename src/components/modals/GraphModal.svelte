<script lang="ts">
	import { type GraphModalData, type ModalEntity, type NodeEvent } from '$lib/types';
	import { onMount, tick } from 'svelte';
	import { store } from '../../store.svelte';
	import GraphNode from '../GraphNode.svelte';
	import ZoomPan from '../ZoomPan.svelte';

	let{close, modal_data, on_close, use_search, window_rect}:{close: any, modal_data: GraphModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean, window_rect: DOMRect} = $props()

	let offset_limit = $derived({x: -20, y: -20, width: window_rect.width, height: window_rect.height});
	let current_transform_state: {x: number, y: number, scale: number} = {x: 0, y: 0, scale: 1};
	let graph_element: any;

	let head_node: GraphNode;

	
	let zoompan_element: ZoomPan;
	
	function on_zoompan(transf: {x: number, y: number, scale: number}){
		current_transform_state = transf;
	}

	function move_to_center(rect: {x: number, y: number, width: number, height: number}, new_scale: number, delay?: number){
		const center_pos: {x: number, y: number} = {x: window_rect.width/2, y: window_rect.height/2}
		const delta_scale = new_scale / current_transform_state.scale

		/* For html reasons, this function assumes that rect.x is given in screen-coordinates, 
		while the current_transform_state.x is measured relative to the left edge of the container. 
		Corrected_x is supposed to be the number of pixels between the current_transform_state.x and the center of rect. */
		const corrected_x = rect.x + rect.width / 2 - current_transform_state.x - window_rect.x
		const corrected_y = rect.y + rect.height / 2 - current_transform_state.y - window_rect.y

		/*I think the overhead in creating each variable is worth it for readability. The corrected_x/y - variables is measured in the current
		number of pixels. This value is the only value changed after the rescaling.*/
		const corrected_and_rescaled_x = corrected_x * delta_scale
		const corrected_and_rescaled_y = corrected_y * delta_scale

		const target_x = center_pos.x - corrected_and_rescaled_x;
		const target_y = center_pos.y - corrected_and_rescaled_y;

		zoompan_element.set_transform({x: target_x, y: target_y, scale: new_scale}, delay ?? 0);
		head_node.propagate_position(current_transform_state.scale);
	}
	
	let init_occupied: boolean = false;
	async function on_node_event(event: NodeEvent, previous_position: {x: number, y: number, width: number, height: number}, current_position: {x: number, y: number, width: number, height: number})
	{
		const autoscale_limit = 0.5
		switch(event){
			case 'init' : {
				/* This is written somewhat fragile - it will typically be called immediately followed by a 'toggle'-call, 
				which is prone to override any change made here. As a temporary work-around, I made the set_transform in the
				not-autoscalling toggle to only set x-transform, but that assumption is for instance violated. */

				const overflow_y = current_position.y + current_position.height - (window_rect.y + window_rect.height);
				if(!init_occupied && current_transform_state.scale < autoscale_limit && overflow_y > 0)
				{	
					init_occupied = true;
					await zoompan_element.set_transform({y: current_transform_state.y - overflow_y - 20}, 200)
					init_occupied = false;
				}
				break;
			}
			case 'toggle': {
				if(current_transform_state.scale < autoscale_limit){
					zoompan_element.set_transform({x: current_transform_state.x - current_position.x + previous_position.x})
				}
				else{
					const initial_transf = {...current_transform_state};
					zoompan_element.set_transform({x: current_transform_state.x - current_position.x + previous_position.x, y: current_transform_state.y - current_position.y + previous_position.y})
					const delta_x = current_transform_state.x - initial_transf.x;
					const delta_y = current_transform_state.y - initial_transf.y;
					move_to_center({...current_position, x: current_position.x + delta_x, y: current_position.y + delta_y}, 0.8, 500)
				}
				head_node.propagate_position(current_transform_state.scale);
				break;
			}
		}
	}

	onMount(() => {
		const rect: DOMRect = graph_element.getBoundingClientRect();
		const half_width: number = 125;
		const half_height: number = 100;
		tick().then(() => {
			move_to_center({x: rect.x + rect.width / 2 - half_width, y: rect.y + rect.height / 2 - half_height, width: 2*half_width, height: 2*half_height}, 0.8)
			head_node.propagate_position(current_transform_state.scale);
		})
	})

</script>

<div id="graph" bind:this={graph_element}>
	<GraphNode id={store.project_cache[store.project_id].head_map_id} bind:this={head_node} graph_entities={modal_data.graph_entities} on_event={on_node_event}/>
	<ZoomPan bind:this={zoompan_element} parent_selector='#graph' offset_limit={offset_limit} scale_limit={null} on_zoompan={on_zoompan}/>
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
		user-select: none;
	}

</style>
