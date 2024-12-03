<script lang='ts'>
	import type { GraphEntity, ModalEntity } from "$lib/types";
	import { onMount, tick, untrack } from "svelte";
    import Self from './GraphNode.svelte';
    import { type NodeEvent } from "$lib/types";
	import { store } from "../store.svelte";
	import { get } from "svelte/store";
	import type { SvelteMap } from "svelte/reactivity";

    let {id, graph_entities, on_event, optional_event_prop} : {id: number, graph_entities: {[id: number]: GraphEntity}, on_event: (event: NodeEvent, id: number, previous_position: {x: number, y: number, width: number, height: number}, current_position: {x: number, y: number, width: number, height: number}) => void, optional_event_prop: {display: boolean, images: {[id: number]: string}}} = $props()
    let isOpen = $state<boolean>(false);

    let graph_entity = $derived(graph_entities[id])

    let children_ids = $derived(graph_entity.children)
    
    /*This is a little strange: Svelte will reflexively populate this list if children are missing, 
    and set their values to null if they are deleted. I've just added overhead to make sure the list is pruned, which is a little bad.*/
    let children = $state<Array<Self>>(new Array<Self>(0));

    const prune_children = async () => {
        tick().then(() => {
            children = children.filter((child) => {return child !== null})
        })
    }

    $effect(()=> {
        if(untrack(()=>children.length) !== children_ids.length)
        prune_children()
    })

    let entity = $derived<ModalEntity>(graph_entity.entity)
    let has_image = $derived<boolean>(entity.image !== null)

    
    let edge_start = $state<{x: number, y: number}>({x: 0, y: 0});

    let bezier_paths = $state<Array<string>>(new Array(children.length))

    export const propagate_position: (scale: number) => {x: number, y: number} = (scale) => {
        // I need scale to convert from svg / div - scale to pixel scale (I think), and I need svg-offset because the getBoundingClient is relative to screen, while the svg-element takes coordinates relative to the svg-div.
        
        const svg_offset = svg_element?.getBoundingClientRect() ?? {left: 0, top: 0, width: 0, height: 0}
        const rect = node_element.getBoundingClientRect()
        edge_start = {x: svg_offset.width/2 / scale, y: 0}
        // if(bezier_paths.length !== children.length){
        //     bezier_paths = new Array(children.length)}
        bezier_paths = new Array(children_ids.length)
        if (isOpen && children_ids.length > 0)
        {
            children.forEach((child, id) => {
                if(!child){return}
                let edge_end = child.propagate_position(scale)
                edge_end.x = (edge_end.x - svg_offset.left) / scale;
                edge_end.y = (edge_end.y - svg_offset.top) / scale - 10;
                bezier_paths[id] = get_bezier_path(edge_start, edge_end)
            }
            )
        }
        
        return({x: rect.left + rect.width/2, y: rect.top})
    }

    function get_bezier_path(parent_position: {x: number, y: number}, child_position: {x: number, y: number}) {
        const bezier_factor = Math.abs(parent_position.x - child_position.x) ** 0.7;
        const p1 = parent_position;
        const p2 = { x: p1.x, y: p1.y + bezier_factor  };
        const p3 = { x: child_position.x, y: child_position.y - bezier_factor };
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
            on_event('toggle', id, {x: initial_rect.x, y: initial_rect.y, width: initial_rect.width, height: initial_rect.height}, {x: new_rect.x, y: new_rect.y, width: new_rect.width, height: new_rect.height});
        })
    }

    function request_zoom(){
        const current_rect = node_element.getBoundingClientRect();
        on_event('zoom', id, current_rect, current_rect)
    }

    function optional_event_func(){
        const current_rect = node_element.getBoundingClientRect();
        on_event('optional', id, current_rect, current_rect)
    }

    onMount(()=>{
        const initial_rect = node_element.getBoundingClientRect();
        const rect = {x: initial_rect.x, y: initial_rect.y, width: initial_rect.width, height: initial_rect.height}
        on_event('init', id, rect, rect)
    })
</script>

<div class="node">
    <div class='entity' bind:this={node_element} 
        class:enlarged_text={!has_image}
        style={entity.background_image ? `background-image: url("${entity.background_image}");`: ''}>
        
        {#if has_image}
            <div class='image-container' onclick={entity.on_click}>
                <img class='entity-image' src={entity.image}/>
            </div>
        {/if}

        <div class='text_row'>
            {#if optional_event_prop.display}
            <button class='optional_func_button' onclick={optional_event_func}  
                style={optional_event_prop.images[id] ? `background-image: url("${optional_event_prop.images[id]}");`: ''}>
            </button>
            {/if}
            {#if children_ids.length > 0}
            <div class="toggle_children" onclick={toggle}>
                {isOpen ? '▼' : '▶'}
            </div>
            {/if}
            <div class="label" onclick={request_zoom}>
                {entity.title}
            </div>

            {#if entity.optional_func && store.write_access}
            <button class='option_button' class:no_image={!has_image} onclick={(e: Event)=>{if(entity.optional_func)entity.optional_func(); e.stopPropagation();}}>
            </button>	
            {/if}
        </div>
    </div>
    {#if isOpen && children_ids.length > 0}
        <svg class='edge_canvas' bind:this={svg_element}>
            {#each bezier_paths as path}
                {#if path}
                    <path d={path} fill="transparent" stroke-linecap="round"/>
                {/if}
            {/each}
        </svg>
        <div class="children">
            {#each children_ids as child_id, index (child_id)}
                <Self bind:this={children[index]} id={child_id} graph_entities={graph_entities} on_event={on_event} optional_event_prop={optional_event_prop}/>
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
    
    .entity {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 20px;
        margin: 10px 0px;
        padding: 10px;
        background-color: rgb(50, 50, 50);
        background-position: top right;
        background-size: 100%;
        
        border-radius: 10px;
        box-shadow: 5px 5px 5px rgb(10, 10, 10);
        width: 250px;
        font-size: x-large;
    }
    
    .entity.enlarged_text{
        font-size: xx-large;
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

    .text_row{
        position: relative;
        display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;
    }

    .optional_func_button {
		position: relative;
		flex: 0 0 30px;
		aspect-ratio: 1;
		background-color: transparent;
		background-image: url('/assets/more_vert.png');
		background-size: contain;
		background-repeat: no-repeat;
        background-position: center center;
		border: none;
		cursor: pointer;

        margin-right: 10px;
	}

	.optional_func_button:hover{
		opacity: 0.7;
	}

    .toggle_children{
        position: relative;
        cursor: pointer;
        font-weight: bold;
        margin: 0;
        flex: 0 0 30px;
        color: var(--main_white);
        font-family: 'Cormorant Garamond';
        text-align: center;
        margin-right: 10px;
    }

    .toggle_children:hover{
        opacity: 0.7;
	}

    .label {
        position: relative;
        cursor: pointer;
        font-weight: bold;
        margin: 0;
        color: var(--main_white);
        font-family: 'Cormorant Garamond';
        flex: 1;
        max-width: 70%;
    }

    .option_button {
		position: relative;
		flex: 0 0 30px;
		aspect-ratio: 0.5;
		background-color: transparent;
		background-image: url('/assets/more_vert.png');
		background-size: contain;
		background-repeat: no-repeat;
		border: none;
		cursor: pointer;
	}

    .option_button.no_image{
        flex: 0 0 40px;
        aspect-ratio: 1;
        background-position: center center;

    }

	.option_button:hover{
		opacity: 0.7;
	}
    

    .edge_canvas {
        position: relative;

        vertical-align: top;
        top: 0;
        left: 0;
        width: 100%;
        height: 60px;
        padding: 0px;
        z-index: 0;
    }
    
    path {
        stroke: var(--bright_gold);
        filter: drop-shadow(5px 5px 2px rgb(10, 10, 10));
        stroke-width: 4;
    }

    .children {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
</style>
