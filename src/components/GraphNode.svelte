<script lang='ts'>
	import type { GraphEntity } from "$lib/types";
	import { onMount, tick } from "svelte";
    import Self from './GraphNode.svelte';
    import { type NodeEvent } from "$lib/types";

    let {id, graph_entities, on_event} : {id: number, graph_entities: {[id: number]: GraphEntity}, on_event: (event: NodeEvent, previous_position: {x: number, y: number, width: number, height: number}, current_position: {x: number, y: number, width: number, height: number}) => void} = $props()
    let isOpen = $state<boolean>(false);
    
    let children = $state<Array<Self>>(new Array<Self>(graph_entities[id].children.length));
    
    let edge_start = $state<{x: number, y: number}>({x: 0, y: 0});
    // let edge_ends = $state<Array<{x: number, y: number}>>(new Array(children.length))
    let bezier_paths = $state<Array<string>>(new Array(children.length))

    export const propagate_position: (scale: number) => {x: number, y: number} = (scale) => {
        // I need scale to convert from svg / div - scale to pixel scale (I think), and I need svg-offset because the getBoundingClient is relative to screen, while the svg-element takes coordinates relative to the svg-div.

        const svg_offset = svg_element?.getBoundingClientRect() ?? {left: 0, top: 0, width: 0, height: 0}
        const rect = node_element.getBoundingClientRect()
        edge_start = {x: svg_offset.width/2 / scale, y: 0}
        if (isOpen && graph_entities[id].children.length > 0)
        {
            children.forEach((child, id) =>{
                let edge_end = child.propagate_position(scale)
                edge_end.x = (edge_end.x - svg_offset.left) / scale;
                edge_end.y = (edge_end.y - svg_offset.top - 10) / scale;
                bezier_paths[id] = get_bezier_path(edge_start, edge_end)
            }
            )
        }
        
        return({x: rect.left + rect.width/2, y: rect.top})
    }

    function get_bezier_path(parent_position: {x: number, y: number}, child_position: {x: number, y: number}) {
        const p1 = parent_position;
        const p2 = { x: p1.x, y: p1.y + 25 };
        const p3 = { x: child_position.x, y: child_position.y - 25 };
        const p4 = child_position;
        return `M ${p1.x} ${p1.y} C ${p2.x} ${p2.y}, ${p3.x} ${p3.y}, ${p4.x} ${p4.y}`;
    }

    
    let node_element: any;
    let svg_element = $state<SVGElement>();

    function toggle() {
        const initial_rect = node_element.getBoundingClientRect();

        isOpen = !isOpen;

        tick().then(()=>{
            const new_rect = node_element.getBoundingClientRect();
            on_event('toggle', {x: initial_rect.x, y: initial_rect.y, width: initial_rect.width, height: initial_rect.height}, {x: new_rect.x, y: new_rect.y, width: new_rect.width, height: new_rect.height});
        })
    }

    onMount(()=>{
        const initial_rect = node_element.getBoundingClientRect();
        const rect = {x: initial_rect.x, y: initial_rect.y, width: initial_rect.width, height: initial_rect.height}
        on_event('init', rect, rect)
    })
</script>

<div class="node">
    <div class='entity' bind:this={node_element}>
        <div class='image-container' onclick={graph_entities[id].entity.on_click}>
            <img class='entity-image' src={graph_entities[id].entity.image}/>
        </div>
        {#if graph_entities[id].children.length > 0}
            <div class="label" onclick={toggle}>
                {isOpen ? '▼' : '▶'} {graph_entities[id].entity.title}
            </div>
        {:else}
            <div class="label">
                {graph_entities[id].entity.title}
            </div>
        {/if}
    </div>
    {#if isOpen && graph_entities[id].children.length > 0}
        <svg class='edge_canvas' bind:this={svg_element}>
            {#each bezier_paths as path}
                {#if path}
                    <path d={path} fill="transparent"/>
                {/if}
            {/each}
        </svg>
        <div class="children">
            {#each graph_entities[id].children as child_id, index}
                <Self bind:this={children[index]} id={child_id} graph_entities={graph_entities} on_event={on_event}/>
            {/each}
        </div>
    {/if}
</div>

<style>
    .node {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .label {
        cursor: pointer;
        font-weight: bold;
        margin-top: 0;
        color: var(--main_white);
        font-size: large;
        font-family: 'Cormorant Garamond';
    }

    .edge_canvas {
        position: relative;

        vertical-align: top;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        padding: 0px;
        z-index: 0;
    }
    path {
        stroke: var(--main_gold);
        filter: drop-shadow(5px 5px 2px rgb(10, 10, 10));
        stroke-width: 4;
    }

    .children {
        display: flex;
        flex-direction: row; /* Display children in a row */
        gap: 1rem; /* Add space between child nodes */
    }

    .entity {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 20px;
        margin: 10px 0px;
        padding: 10px;
        background-color: rgb(50, 50, 50);
        border-radius: 10px;
        box-shadow: 5px 5px 5px rgb(10, 10, 10);
    }

    .image-container {
		position: relative;
		width: 250px;
		aspect-ratio: 4/3;
		overflow: hidden;
	}

	.entity-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
	}
</style>
