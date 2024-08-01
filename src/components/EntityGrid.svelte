<script lang="ts">
	import { type SpecialEntity } from '$lib/types';
	import { bind_components } from '$lib/bind_component';

	export let special_entities_: SpecialEntity[] = [];
	export let entities: any = [];

	const handleMapClick = (entity: any) => {
		bind_components(entity.id);
	};
</script>

<div id="grid-container">
	<div id="grid">
		{#each special_entities_ as special_entity}
			<div class="entity-item" on:click={special_entity.func}>
				<div class="image-container">
					<img class="entity-image" src={special_entity.image} alt={special_entity.title} />
				</div>
				<p>{special_entity.title}</p>
			</div>
		{/each}

		{#each entities as entity}
			<div class="entity-item" on:click={() => handleMapClick(entity)}>
				<div class="image-container">
					<img class="entity-image" src={entity.image} alt={entity.title} />
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

	.entity-item {
		cursor: pointer;
		text-align: center;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 150px;
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

	.entity-item p {
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
