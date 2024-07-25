<script lang="ts">
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