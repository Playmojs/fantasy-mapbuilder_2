<script lang="ts">
	import { goto } from "$app/navigation";
	import dtb from "$lib/dtb";
	import { pop_modal, push_modal } from "$lib/modal_manager";
	import { assert_unreachable } from "$lib/utils";
	import ConfirmModal from "../../../components/ConfirmModal.svelte";
	import Homebar from "../../../components/Homebar.svelte";
	import MapOption from "../../../components/MapOption.svelte";
	import Modal from "../../../components/Modal.svelte";
	import { store } from "../../../store.svelte";

    let project_title = $state<string>('')
    let title_input: HTMLInputElement;

    function update_title(){
        project_title = title_input.value;
    }

    function open_map_option(){
        push_modal({
            type:'upload_modal', data: {submit_func: (file: File | null, title: string) => {
                if(file === null){
                    assert_unreachable("No file selected error"); 
                    return;
                }
                main_map_title = title;
                main_map_file = file;
            },
            validation_func(file, title) {
                return(file !== null && title !== '')
            },
            link_func: null,
            initial_link: null,
            button_title: 'Choose Map',
            initial_image_blob: main_map_file,
            initial_map_title: main_map_title ?? '',
            allow_no_file: false,}
        })
    }

    function valid_project(){return main_map_file===null || main_map_title==='' || project_title === ''}
    async function add_project(){
        if (main_map_file === null || main_map_title === '' || !main_map_title || project_title === ''){return;}
        let project = await dtb.create_new_project(project_title, main_map_title, main_map_file);
        if(project){
            store.project_id = project.id
            store.project_cache[store.project_id] = project;
            goto(`/projects/${project.id}/${project.head_map_id}`)
        }
    }

    let main_map_title = $state<string>()
    let main_map_file = $state<File | null>(null)



	let main_map_preview = $derived<string | null>(main_map_file ? URL.createObjectURL(main_map_file) : null)
</script>

<Homebar/>
<main>
    <div id=project_display>
        {#if main_map_preview}
            <div id="image-preview-section">
				<img src={main_map_preview} alt="Image Preview" class="image-preview" />
            </div>
		{/if}
        <div id="project_form">
            <div id="header"><h1>New Project</h1></div>
            <div id="title">
                <p id="title_label">Project Title: </p>
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
                <p id="head_map_label"> {`Main Map: ${main_map_title ?? 'Not added'}`}</p>
                <button id='set_main_map_button' onclick={open_map_option}>{main_map_file ? 'Change' : 'Choose'}</button>
            </div>

            <button id="add_project_button" onclick={add_project} disabled={valid_project()}>Add Project</button>
        </div>
    </div>
</main>

{#each store.modals as modal (modal)}
	{#if modal.type === 'upload_modal'}
		<MapOption
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
			on_close={modal.on_close}
		/>
	{:else if modal.type === 'confirm_modal'}
		<ConfirmModal
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
		/>
	{:else if modal.type === 'choose_modal'}
		<Modal
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
			on_close={modal.on_close}
            use_search={false}
		/>
	{/if}
{/each}

<style>
    #project_display{
        position: relative;
        display: flex;
        justify-content: space-around;
        top: 40px;
        align-items: start;
    }

    #project_form{
        position: relative;
        margin-top: 100px;
        width: 40%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        color: var(--main_white);
        text-shadow: 3px 3px 3px rgb(40, 40, 40);
        background-color: rgb(80, 80, 80);
		padding: 50px 0px;
		border-radius: 5%;
		gap: 30px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
        border: 5px ridge var(--main_gold);
    }

    #project_form > div{
		width: 80%;
		background-color: rgb(70, 70, 70);
		padding: 0px 5%;
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

    #header{
        text-align: center;
    }

    #title{
        position: relative;
        display: flex;
        justify-content: start;
        font-size: x-large;
        align-items: center;
    }

    #title_label{
        padding-right: 80px;
    }

    #title_input{
        position: relative;
        font-size: large;
        height: fit-content;
        font-weight: bold;
        height: 30px;
		background-color: rgb(150, 150, 150);
        box-shadow: inset 2px 2px 2px rgb(40, 40, 40);
		border-radius: 5px;
        width: 50%;
    }

    #head_map{
        position: relative;
        display: flex;
        justify-content: start;
        gap: 20px;
        font-size: x-large;
        align-items: center;
    }

    #set_main_map_button{
        height: fit-content;
        padding: 5px 10px;
        color: var(--main_white);
        font-size: large;
        background-color: rgb(100, 100, 100);
        border-radius: 10%;
        cursor: pointer;
        margin-left: 100px;

    }

    #add_project_button{
        background-color: rgb(20, 150, 20);
        padding: 20px 30px;
        border-radius: 10%;
        margin: 10px 20px;
        font-size: large;
        cursor: pointer;
    }

    #add_project_button:disabled{
        background-color: rgb(30, 100, 30);
        border: none;
        cursor:not-allowed;
    }

    #image-preview-section {
		position: relative;
		width: 50%;
        height: fit-content;
        max-height: 80%;
		margin-top: auto;
		margin-bottom: auto;
	}

	.image-preview {
        position: relative;
		max-width: 100%;
		border-radius: 10px;
        margin-top: 50px;
		box-shadow: 10px 5px 5px rgb(40, 40, 40);
	}
</style>
