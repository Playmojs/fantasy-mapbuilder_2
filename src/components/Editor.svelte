<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';

	let editorElement = $state<HTMLDivElement>();
	let editor = $state<any>();
	let monaco: any;
	let font_size = $derived(store.text_size / 7);

	onMount(async () => {
		monaco = await import('monaco-editor');
		const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');

		self.MonacoEnvironment = {
			getWorker: function (_: any, label: string) {
				return new editorWorker.default();
			}
		};

		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

		if (editorElement) {
			editor = monaco.editor.create(editorElement, {
				automaticLayout: true,
				language: 'markdown',
				fontSize: font_size,
				theme: 'vs-light',
				lineNumbers: 'off',
				wordWrap: 'on',
				minimap: {
					enabled: false
				},
				suggestions: {
					enabled: false
				},
				value: store.article.content
			});
		}
		editor.onDidChangeModelContent(() => {
			store.article.content = editor.getValue();
		});
	});

	$effect(() => {
		if (editor) {
			editor.updateOptions({ fontSize: font_size });
		}
	});

	$effect(() => {
		if (editor && store.article.id !== null) {
			editor.setValue(untrack(() => store.article.content));
		}
	});

	onDestroy(async () => {
		monaco?.editor.getModels().forEach((model: any) => model.dispose());
		editor?.dispose();
		dtb.update_article(store.article);
	});
</script>

<div
	style="height: 100%; width: 100%; font-size: {store.text_size}%;"
	bind:this={editorElement}
	id="editor"
/>

<style>
	#editor {
		background-color: white;
		color: black;
	}
</style>
