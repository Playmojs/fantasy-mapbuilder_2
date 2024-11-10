<script lang='ts'>
	import type { GraphEntity } from "$lib/types";
	import { tick } from "svelte";
    import Self from './GraphNode.svelte';

    let {id, graph_entities, on_toggle} : {id: number, graph_entities: {[id: number]: GraphEntity}, on_toggle: (previous_position: {x: number, y: number, width: number, height: number}, current_position: {x: number, y: number, width: number, height: number}) => void} = $props()
    let isOpen = $state<boolean>(false); // Track whether the branch is open or closed

    let node_element: any;
    // Toggle the branch open/closed
    function toggle() {
        const initial_rect = node_element.getBoundingClientRect();

        isOpen = !isOpen;

        tick().then(()=>{
            const new_rect = node_element.getBoundingClientRect();
            on_toggle({x: initial_rect.x, y: initial_rect.y, width: initial_rect.width, height: initial_rect.height}, {x: new_rect.x, y: new_rect.y, width: new_rect.width, height: new_rect.height});
        })
    }
</script>

<style>
    .node {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 10px;
    }
    .label {
        cursor: pointer;
        font-weight: bold;
        margin-top: 0;
        color: var(--main_white);
        font-size: large;
        font-family: 'Cormorant Garamond';
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
        margin-bottom: 40px;
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
        <div class="children">
            {#each graph_entities[id].children as child_id}
                <Self id={child_id} graph_entities={graph_entities} on_toggle={on_toggle}/>
            {/each}
        </div>
    {/if}
</div>