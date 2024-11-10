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

	let project_markers = $derived<ModalEntity[]>(
		Object.entries(store.project_cache).map(([_, project]) => {
			return {
				image: store.image_public_urls[store.project_images[project.id]]
					? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
					: '/assets/old_map.png',
				title: project.name,
				on_click: () => {
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
						entity.on_click();
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
		width: 100%;
	}

	#title {
		position: relative;
		margin: auto;
		font-size: 4rem;
		color: var(--main_white);
		margin: 40px 0px 30px 0px;
		padding: 20px;
		font-family: 'Cormorant Garamond';
		text-decoration: underline solid rgba(67, 128, 41, 0.8);
		text-underline-offset: 20px;
		text-shadow: 5px 5px 5px rgb(10, 10, 10);
	}

	#projects_container {
		position: relative;
		width: 90%;
		top: 30px;
		max-height: 80vh;

		padding: 20px 50px;

		border-radius: 15px;
		background-color: rgb(90, 90, 90);
		overflow-y: auto;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
		border: 5px ridge var(--main_gold);
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
		background-color: rgb(65, 65, 65);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		
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
		padding-top: 5px;

		max-width: 100%;
		max-height: 95%;

		border-radius: 15px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	.entity-item p {
		position: relative;
		color: var(--main_white);
		font-size: 2rem;
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		margin: 0px 0px 10px 0px;
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
