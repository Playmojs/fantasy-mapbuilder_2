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
	
	let project_markers = $derived<{ [id: number]: ModalEntity }>(
		Object.fromEntries(
			my_projects.map((project) => [
				project.id,
				{
					image: store.image_public_urls[store.project_images[project.id]]
						? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
						: '/assets/old_map.png',
					title: project.name,
					on_click: () => {
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
		gap: 30px;
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
		/* max-height: 80vh; */
		height: fit-content;
		
		border-radius: 15px;
		background-color: rgb(90, 90, 90);
		overflow-y: auto;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
		border: 5px ridge var(--main_gold);
	}
	
	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 0.5fr));
		grid-template-rows: repeat(auto-fill, 250px);
		gap: 50px;
		
		padding: 20px 50px;
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

	@media(max-width: 1200px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(180px, 0.5fr));
			grid-template-rows: repeat(auto-fill, 180px);
		}
	}
	
	@media(max-width: 768px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(120px, 0.5fr));
			grid-template-rows: repeat(auto-fill, 120px);
			gap: 20px;
			padding: 20px 20px;
		}

		#add_project_button {
			left: 2.5%;
			top: 8.7rem;
			height: 6%;
			aspect-ratio: 2;
			border-radius: 10%;
			color: var(--main_white);
			text-shadow: 3px 3px 2px rgb(80, 80, 80);
			background-color: var(--main_green);
			border: none;
			font-size: 1rem;
			font-family: 'Cormorant Garamond';
			font-weight: bold;
			cursor: pointer;
			z-index: 10;
			box-shadow: 5px 5px 5px rgb(0, 0, 0);
		}

		.entity-item p {
			font-size: 1rem;
		}
		#title{
			font-size: 2rem;
		}
	}
</style>
