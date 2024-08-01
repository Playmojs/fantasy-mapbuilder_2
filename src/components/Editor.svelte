<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let editorElement = $state<HTMLDivElement>();
	let editor = $state<any>();
	let monaco: any;

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
				theme: 'vs-dark'
			});
		}
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model: any) => model.dispose());
		editor?.dispose();
	});
</script>

<div style="height: 100%; width: 100%" bind:this={editorElement} />
