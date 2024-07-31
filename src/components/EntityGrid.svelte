<script lang="ts">
	export let entities: any = [];
	export let selectMap;

	const handleMapClick = (entity: any) => {
		selectMap(entity.id);
	};
</script>

<div id="grid-container">
	<div id="grid">
		{#each entities as entity}
			<div class="map-item" on:click={() => handleMapClick(entity)}>
				<div class="image-container">
					<img class="map-image" src={entity.image} alt={entity.title} />
				</div>
				<p>{entity.title}</p>
			</div>
		{/each}
	</div>
</div>

<style>
	#grid-container {
		max-height: calc(100vh - 200px);
		overflow-y: auto;
		padding-right: 15px;
	}

	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 20px;
	}

	.map-item {
		cursor: pointer;
		text-align: center;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 150px;
		overflow: hidden;
	}

	.map-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
	}

	.map-item p {
		color: white;
	}

	#grid-container::-webkit-scrollbar {
		width: 12px;
	}

	#grid-container::-webkit-scrollbar-track {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#grid-container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#grid-container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}
</style>
