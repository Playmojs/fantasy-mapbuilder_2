<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import Homebar from '../../components/Homebar.svelte';
	import dtb from '../../lib/dtb';
	import { store } from '../../store.svelte';

	const get_projects = async () => {
		await dtb.fetch_all_projects();
	};
	get_projects();

	let project_markers = $derived<ModalEntity<void>[]>(
		Object.entries(store.project_cache).map(([_, project]) => {
			return {
				image: store.image_public_urls[store.project_images[project.id]]
					? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
					: '/assets/map_icon.png',
				title: project.name,
				on_result: () => {
					if(project.head_map_id === null){assert_unreachable("Trying to go to map with id null")}
					goto(`/projects/${project.id}/${project.head_map_id}`);
				}
			};
		})
	);
</script>

<Homebar />
<main>
	<h1 id="title">Existing Projects</h1>
	<div id="projects_container">
		<div id="grid">
			{#each project_markers as entity}
				<div
					class="entity-item"
					onclick={() => {
						entity.on_result();
					}}
				>
					<div class="image-container">
						<img class="entity-image" src={entity.image} alt={entity.title} />
					</div>
					<p>{entity.title}</p>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

	#title {
		position: relative;
		margin: auto;
		color: white;
		margin-top: 50px;
	}

	#projects_container {
		position: relative;
		width: 90%;
		top: 30px;
		max-height: 80vh;

		padding: 20px 50px;

		border-radius: 15px;
		background-color: grey;
		overflow-y: auto;
	}

	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 0.5fr));
		gap: 50px;
	}

	.entity-item {
		position: relative;
		cursor: pointer;
		text-align: center;
		background-color: rgb(47, 47, 47);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		
	}

	.image-container {
		position: relative;
		width: 80%;
		height: 250px;
		overflow: hidden;
		margin: 10px;
	}

	.entity-image {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;

		border-radius: 15px;
		border-width: 3px;
		border-color: rgb(47, 47, 47);
		border-style: solid;
	}

	.entity-item p {
		position: relative;
		color: white;
		font-size: 2rem;
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		margin: 10px 0px;
	}


	#projects_container::-webkit-scrollbar {
		width: 12px;
	}

	#projects_container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#projects_container::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#projects_container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	@media (max-width: 1500px) {
		#projects_container {
			max-height: 50vh;
			width: 87%;

			padding: 20px 50px;
		}
		.image-container{
			height: 150px;
		}
	}

	@media (max-width: 1150px) {
		#grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 0.5fr));
			gap: 25px;
		}
		#projects_container {
			max-height: 50vh;
			width: 83%;

			padding: 20px 50px;
		}
	}
</style>
