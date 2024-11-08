<script lang='ts'>
	import type { GraphEntity } from "$lib/types";
    import Self from './GraphNode.svelte';

    let {id, graph_entities} : {id: number, graph_entities: {[id: number]: GraphEntity}} = $props()
    let isOpen = $state<boolean>(false); // Track whether the branch is open or closed

    // Toggle the branch open/closed
    function toggle() {
        isOpen = !isOpen;
    }
</script>

<style>
    .node {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 10px;
    }
    .label {
        cursor: pointer;
        font-weight: bold;
        margin-top: 0;
    }
    .children {
        margin-left: 1rem;
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
    }

    .image-container {
		position: relative;
		width: 200px;
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
    <div class='entity'>
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
                <Self id={child_id} graph_entities={graph_entities}/>
            {/each}
        </div>
    {/if}
</div>