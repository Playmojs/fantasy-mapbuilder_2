<script lang="ts">
	import dtb from "$lib/dtb";
    import {type MapData, type Project} from "$lib/types"
	import Homebar from "../../../../components/Homebar.svelte";
	import { store } from "../../../../store.svelte";

    async function get_data(){
        await dtb.get_project(store.project_id)
        await dtb.fetch_project_images([store.project_cache[store.project_id]])
        await dtb.get_map(store.project_id, store.project_cache[store.project_id].head_map_id)
    }
    get_data()
    let project = $derived<Project>(store.project_cache[store.project_id])
    let main_map = $derived<MapData>(store.map_cache[project.head_map_id])

    let project_title = $state<string>('')
    let title_input: HTMLInputElement;

    $effect(() => {project_title = project.name})
    function update_title(){
        project_title = title_input.value;
    }


	let main_map_preview = $derived<string | null>(main_map ? (store.image_public_urls[main_map.image] !== null ? URL.createObjectURL(store.image_public_urls[main_map.image]) : null) : null);

</script>

<main>
    <Homebar/>
    <div id=project_display>
        <div id="image-preview-section">
			{#if main_map_preview}
				<img src={main_map_preview} alt="Image Preview" class="image-preview" />
			{:else}
				<p class="no-image">No image selected</p>
			{/if}
		</div>
        <div id="project_form">
            <h1>{`Project #${project.id}`}</h1>
            <div id="title">
                <label id="title_label">Project Title: </label>
                <input
                    id="title_input"
                    value={project_title}
                    bind:this={title_input}
                    onkeyup={() => {
                        update_title();
                    }}
                    required
                />
            </div>
            <div id="head_map">
                <p id="head_map_label"> {`Main Map: ${main_map?.title ?? ''}`}</p>
                <button id='change_head_map_button'>Change</button>
            </div>
            <div id="execute_buttons">
                <button id="delete_button">Delete Project</button>
                <button id="update_button">Save Changes</button>
            </div>
        </div>
    </div>
</main>

<style>
    main{
        width: 100%;
    }

    #project_display{
        position: relative;
        display: flex;
        justify-content: space-around;
        height: 100%;
        align-items: center;
    }

    #project_form{
        position: relative;
        width: 40%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        color: white;
        gap: 30px;
    }

    #title{
        position: relative;
        display: flex;
        justify-content: space-around;
        gap: 20px;
        font-size: x-large;
    }
    #head_map{
        position: relative;
        display: flex;
        justify-content: space-around;
        gap: 20px;
        font-size: x-large;
    }

    #execute_buttons{
        gap: 20px;
    }

    #image-preview-section {
		position: relative;
		width: 50%;
        height: 80%;
        margin-top: auto;
        margin-bottom: auto;
	}

	.image-preview {
        position: relative;
		height: auto;
        max-height: 80%;
		max-width: 100%;
		border-radius: 10px;
	}

	.no-image {
		color: white;
		font-size: 1.5rem;
		text-align: center;
	}
</style>
