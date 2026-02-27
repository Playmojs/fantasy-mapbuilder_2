<script lang="ts">
	import type { ConfirmModalData } from "$lib/types";

    let { modal_data, close }: { modal_data: ConfirmModalData; close: any } = $props();

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
		margin: var(--space-lg) 0;
    }

    button{
        position: relative;
		background-color: var(--color-border);
		cursor:pointer;
        width: 30%;
		font-size: large;
		color: var(--color-text-primary);
		border-radius: var(--radius-md);
		padding: var(--space-xs) 0;
		box-shadow: var(--shadow-sm);
    }

    h1{
        color: var(--color-text-primary);
		text-shadow: var(--text-shadow-base);
    }
</style>
