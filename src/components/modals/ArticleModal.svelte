<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { store } from '../../store.svelte';
	import Editor from '../Editor.svelte';
	import dtb from '$lib/dtb';
	import { get_article_options, push_modal } from '$lib/modal_manager.svelte';
	import KeyWordRenderer from '../KeyWordRenderer.svelte';
	import { pop_article, undo_article_pop} from '$lib/article_stack';
	import type { Article } from '$lib/types';

	let article_title: HTMLHeadElement;


    let {close, article, on_close} : {close: () => void, article: Article, on_close?: (success: boolean) => void} = $props()

	function updateTitle() {
		const title: string = article_title.innerText;

		article.title = title;
        dtb.update_article(article)
	}
	
	function open_article_options(){
		push_modal(get_article_options(article.id))
	}
	
	let image_source = $state('');
	$effect(() => {
		if (article.image && store.image_public_urls[article.image]) {
			image_source = URL.createObjectURL(store.image_public_urls[article.image]);
		}
	});

	function change_text_size(factor: number) {
		store.text_size = store.text_size * factor;
	}

</script>

<div
	id="article_modal"
	class:edit_mode={store.edit_mode}
>
	<div id='button_bar'>

		<button
			id="undo_article_button"
			onclick={() => {
				pop_article();
			}}
			style="background-image: url('/assets/arrow_left.png');"
			title="Go to last Article"
			aria-label='Undo Button'
			disabled={store.article_history.length <= 1}
		></button>	
		
		<button
			id="redo_article_button"
			onclick={() => {
				undo_article_pop();
			}}
			disabled={store.undone_articles.length === 0}
			style="background-image: url('/assets/arrow_right.png');"
			title="Go to next Article"
			aria-label='Redo Button'
		></button>

		<button
			id="increment_text_size_button"
			onclick={() => {
				change_text_size(1.1);
			}}
			style="background-image: url('/assets/fantasy-plus.png');"
			title="Increase text size"
			aria-label='Increase Text Size Button'
		></button>

		<button
			id="decrement_text_size_button"
			onclick={() => {
				change_text_size(0.9);
			}}
			style="background-image: url('/assets/fantasy_minus.png');"
			title="Decrease text size"
			aria-label='Decrease Text Size Button'
			></button>

			<button 
			id="edit_image_button" 
			onclick={open_article_options}
			style="background-image: url('/assets/fantasy_cog.png');"
			class:hidden={!store.edit_mode}
			title="Increase text size"
			aria-label='Increase Text Size Button'
		></button>
        <div
            id="article_title"
            contenteditable={store.edit_mode}
            class={store.edit_mode ? 'editable' : 'non-editable'}
            onblur={() => {
                updateTitle();
            }}
        >
            <h1 bind:this={article_title}>{article.title}</h1>
	    </div>
	</div>
    <div id='article_reader'>
        <div id="image_container" style="height: {article.image !== null ? 30 : store.edit_mode ? 10 : 0}%;">
            <img
            id="article_image"
            src={image_source}
            alt="Article image"
            class:hidden={article.image === null}
            />
        </div>
        <div
            id="article_content"
            class={store.edit_mode ? 'editable' : 'non-editable'}
            style="font-size: {store.text_size}%;"
        >
            {#if store.edit_mode}
                <Editor />
            {:else}
                <SvelteMarkdown source={article.content} renderers={{link: KeyWordRenderer}}/>
            {/if}
        </div>
    </div>
</div>

<style>
    #article_modal{
        display: flex;
        flex-direction: column;
    }

    #button_bar{
        position: relative;
		display: flex;
		gap: 20px;
		height: 50px;
		flex-shrink: 0;
        margin-bottom: 30px;
	}
    
    #article_title {
        position: relative;
        height: 7%;
        min-width: 400px;
        max-width: 800px;
        margin: 0 auto;
        
        
        font-size: 150%;
        text-align: center;
        border-radius: 10px;
        font-family: 'Garamond Semibold Italic';
        white-space: nowrap;
        color: var(--main_white);
    }

    #article_reader {
        max-height: 65vh;
        
        background-color: rgb(47, 47, 47);
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
        gap: 20px;
        padding: 1  0px;
        
        box-shadow: inset 5px 0px 5px rgb(20, 20, 20);
    }

    #article_image {
        position: relative;
        width: 90%;
        border-radius: 10px;
    }
    
    #article_content {
        position: relative;
        height: 90%;
        left: 0;
        right: 0;
        background-color: inherit;
        font-family: 'Garamond Regular';
        text-align: justify;
        padding: 0px 10px;
        border-radius: 10px;
        color: var(--main_white);
        white-space: normal;
    }

	#button_bar button{
		position: relative;
		aspect-ratio: 4/3; 
		height: 80%;
		border: none;
		cursor: pointer;
		background-size: contain;
		background-position: center center;
		background-color: rgb(60, 60, 60);
		border-radius: 10px;
		background-repeat: no-repeat;
		box-shadow: 3px 3px 5px rgb(30, 30, 30);
	}

	#button_bar button:active{
		box-shadow: inset 3px 3px 3px rgb(50, 50, 50);
	}

	#edit_image_button.hidden{
		display: none;
	}
	
	#redo_article_button:disabled{
		cursor: default;
		box-shadow: none;
		filter: brightness(70%);	
	}

	#undo_article_button:disabled{
		cursor:default;
		box-shadow: none;
		filter: brightness(70%);
	}


	#article_title h1 {
		margin: 0;
		padding: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	#article_title.editable{
		color: black;
		background-color: rgba(220, 220, 220, 0.8);
	}


	h1 {
		margin: 5px;
	}

	#article_content.editable {
		background-color: white;
		color: black;
		white-space: pre-wrap;
		padding: 10px 0px 0px 5px;
	}

	#article_reader::-webkit-scrollbar-track.editable {
		background: white;
	}

	#article_reader::-webkit-scrollbar {
		width: 12px;
	}

	#article_reader::-webkit-scrollbar-track.non-editable {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#article_reader::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#article_reader::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#article_reader::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	#image_container{
		display: flex;
	}


	#article_image.hidden {
		display: none;
	}

	/* Fonts */

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Regular.ttf');
		font-weight: normal;
		font-style: normal;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Bold.ttf');
		font-weight: bold;
		font-style: normal;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-Italic.ttf');
		font-weight: normal;
		font-style: italic;
	}

	@font-face {
		font-family: 'Cormorant Garamond';
		src: url('/fonts/Cormorant_Garamond/CormorantGaramond-SemiBoldItalic.ttf');
		font-weight: 600;
		font-style: italic;
	}

	:global(p) {
		font-family: 'Cormorant Garamond', serif;
	}

	:global(strong) {
		font-family: 'Cormorant Garamond';
		font-weight: bold;
	}

	:global(em) {
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
	}

	h1 {
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
	}
</style>
