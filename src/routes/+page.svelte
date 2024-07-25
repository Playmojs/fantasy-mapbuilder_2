<script lang="ts">
	import Map from '../components/Map.svelte';
	import Informatic from '../components/Informatic.svelte';
	import Toolbar from '../components/Toolbar.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	

	let markers = [
		{ position: { x: 30, y: 50 }, image: '/assets/marker.png', map_id: 'map1' },
		{ position: { x: 60, y: 20 }, image: '/assets/marker.png', map_id: 'map2' }
	];

	onMount(() => {
    	goto('/1');
  	});
	
</script>