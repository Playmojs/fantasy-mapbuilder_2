<script lang="ts">
	import type { ConfirmModalData } from "$lib/types";

    let { modal_data, close }: { modal_data: ConfirmModalData; close: any } = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};

    async function confirm(){
        modal_data.confirm_function()
        close()
    }

    function cancel(){
        close()
    }

</script>

<h1>{modal_data.text ?? ''}</h1>
<div id="buttonrow">
	<button onclick={()=>{confirm()}}>Confirm</button>
	<button onclick={()=>{cancel()}}>Cancel</button>
</div>

<style>
    #buttonrow{
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 40%;
		margin: 20px 0px;
    }

    button{
        position: relative;
		background-color: rgb(80, 80, 80);
		cursor:pointer;
        width: 30%;
		font-size: large;
		color: var(--main_white);
		border-radius: 10%;
		padding: 7px 0px;
		box-shadow: 3px 3px 3px rgb(10, 10, 10);
    }

    h1{
        color: var(--main_white);
		text-shadow: 3px 3px 3px rgb(10, 10, 10);
    }
</style>
