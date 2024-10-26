<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import Homebar from '../../components/Homebar.svelte';
	import dtb from '../../lib/dtb';
	import { store } from '../../store.svelte';

	const get_projects = async () => {
		await dtb.get_my_project_ids();
		await dtb.get_projects(store.user_projects);
		await dtb.fetch_project_images(my_projects);
	};
	get_projects();

	
	let my_projects = $derived<Project[]>(
		Object.values(store.project_cache).filter((project) => {
			return store.user_projects.includes(project.id);
		})
	);
	
	let project_markers = $derived<{ [id: number]: ModalEntity<void> }>(
		Object.fromEntries(
			my_projects.map((project) => [
				project.id,
				{
					image: store.image_public_urls[store.project_images[project.id]]
						? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
						: '/assets/old_map.png',
					title: project.name,
					on_result: () => {
						goto(`/projects/${project.id}/${project.head_map_id}`);
					}
				}
			])
		)
	);

	$effect(() => {
		if (store.user) {
			get_projects();
		}
	});

</script>

<Homebar />
<main>
	<button id="add_project_button" onclick={()=>{goto(`/projects/new_project`);}}>New Project</button>
	<h1 id="title">My Projects</h1>
	<div id="projects_container">
		<div id="grid">
			{#each Object.entries(project_markers) as [id, entity]}
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
					<button
						id="edit_project"
						onclick={(e: Event) => {
							goto(`/projects/${id}/home`);
							e.stopPropagation();
						}}
					></button>
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
	
	#add_project_button {
		position: absolute;
		left: 80px;
		top: 9rem;
		height: 70px;
		aspect-ratio: 3;
		border-radius: 10%;
		color: var(--main_white);
		text-shadow: 3px 3px 2px rgb(80, 80, 80);
		background-color: var(--main_green);
		border: none;
		font-size: 2rem;
		font-family: 'Cormorant Garamond';
		font-weight: bold;
		cursor: pointer;
		z-index: 10;
		box-shadow: 5px 5px 5px rgb(0, 0, 0);
	}
	
	#title {
		position: relative;
		margin: auto;
		color: var(--main_white);
		font-size: 4rem;
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
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
		border: 5px ridge var(--main_gold);
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

	#edit_project {
		position: absolute;
		top: 10px;
		height: 20px;
		right: 10px;
		aspect-ratio: 1;
		background-color: transparent;
		background-image: url('/assets/cog.png');
		background-size: contain;
		background-repeat: no-repeat;
		border: none;
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
		.image-container {
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
