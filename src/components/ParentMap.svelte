<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

    let parentMap: HTMLImageElement;

    import edit_mode from '../store'
	let editable: boolean;
	$: editable = $edit_mode;
    
    export let parent_image: string | null;
    export let parent_id: number | null;
    
    onMount(() => {
        parentMap.addEventListener('click', () => parent_func(parent_id));
    });

    function parent_func(parent_id: number | null)
    {
        if(parent_id !== null){
        location.href = `/${parent_id}`;
    }}
</script>

<img src={parent_image} id="parent_map" class:edit_mode ={editable} class:hidden = {!parent_image} bind:this={parentMap} alt="Parent Map"/>

<style>
    #parent_map {
		position: fixed;
		top: 0%;
		right: 80%;
		width: 20%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}
	#parent_map.edit_mode {
		top: 7%;
	}

    #parent_map.hidden
    {
        display: none;
    }
</style>