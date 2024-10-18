<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { choose_article_by_id, choose_existing_map, push_promise_modal } from '$lib/modal_manager';
	import { keywords } from '$lib/keyword_manager';

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

		monaco.languages.registerCompletionItemProvider("markdown", {
			triggerCharacters: ["]"],
			provideCompletionItems: function (model: any, position: any) {
			const text = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: position.column - 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column
			});

			if (text === "]") {
				return {
				suggestions: [
					{
					label: 'map',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: '(/map=)',
					documentation: 'Insert a map link',
					},
					{
					label: 'article',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: '(/article=)',
					documentation: 'Insert an article link',
					}
				]
				};
			}
			}
		});

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
		
		let decorationIds: any[] = [];

		function highlight_keywords() {
			const model = editor.getModel();
			const text = model.getValue();
			let decorations: any[] = [];

			Object.entries(keywords).forEach(([keyword, {regex}]) => {
				let match;
				while (regex.global && (match = regex.exec(text))) {
					const start = match.index;
					const end = start + match[0].length;

					decorations.push({
						range: new monaco.Range(
							model.getPositionAt(start).lineNumber,
							model.getPositionAt(start).column,
							model.getPositionAt(end).lineNumber,
							model.getPositionAt(end).column
						),
						options: {
							inlineClassName: 'keyword',
							hoverMessage: { value: `Click to edit ${keyword} id` }
						}
					});
				}
			});

			decorationIds = editor.deltaDecorations(decorationIds, decorations);
		}


		editor.onMouseDown(async (event: any) => {
			if(event.event.ctrlKey){return;}
			const position = event.target.position;
			const decorationsAtPosition = editor.getDecorationsInRange(new monaco.Range(
				position.lineNumber, position.column, position.lineNumber, position.column
			));

			const clickedKeyword = decorationsAtPosition.find((deco: any) => deco.options.inlineClassName === 'keyword');

			if (clickedKeyword) {
				Object.entries(keywords).forEach(([keyword, {choose_modal, regex}]) => {
					const keyword_content = editor.getModel().getValueInRange(clickedKeyword.range);
					const match = keyword_content.match(regex);

					if (match) {
						choose_modal().then((result) => {
							if (result===undefined){return}
							update_keyword_id(keyword, result, clickedKeyword.range)
						})
					}
				});
			}
		});

		function update_keyword_id(keyword: string, id: number, range: any) {
			const newText = `/${keyword}=${id}`;
			editor.executeEdits("", [
			{ range, text: newText, forceMoveMarkers: true }
			]);
			highlight_keywords();
		}

		editor.onDidChangeModelContent(() => {
			store.article.content = editor.getValue();
			highlight_keywords();
		});

		function write_id(id: number) {
			insertMarkdownSyntax(`[${id}]`);
		}

		function insertMarkdownSyntax(syntax: string) {
			const position = editor.getPosition();
			const range = new monaco.Range(
			position.lineNumber,
			position.column,
			position.lineNumber,
			position.column
			);

			editor.executeEdits("", [
			{ range, text: syntax, forceMoveMarkers: true }
			]);
		}
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
></div>

<style>
	#editor {
		background-color: white;
		color: black;
	}

	.keyword {
		color: red !important;
		cursor: pointer;
		text-decoration: underline;
		font-weight: bold;
		font-style: oblique;
	}

</style>
