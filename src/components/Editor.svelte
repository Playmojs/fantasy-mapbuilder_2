<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { choose_article_by_id, choose_existing_map, push_promise_modal } from '$lib/modal_manager';

	let editorElement = $state<HTMLDivElement>();
	let editor = $state<any>();
	let monaco: any;
	let font_size = $derived(store.text_size / 7);

	type Keyword = {
		openModal: (position: any, regex: RegExp)=> void;
		regex: RegExp;
	}

	onMount(async () => {
		monaco = await import('monaco-editor');
		const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');

		self.MonacoEnvironment = {
			getWorker: function (_: any, label: string) {
				return new editorWorker.default();
			}
		};

		const keywords: {[key: string] : Keyword} = {
			"map": {
				openModal: async(position: any, regex: RegExp)=>{
					const result: number | undefined = await push_promise_modal({type: 'choose_modal', data: {Maps: await choose_existing_map()}})
					if(result === undefined){return}
					replaceKeywordWithId('map', result, position, regex)
				},
				regex: /\/map=(\d+)+/i,
			},
			"article": {
				openModal: async(position: any, regex: RegExp)=>{
					const result: number | void = await push_promise_modal({type: 'choose_modal', data: {Maps: await choose_article_by_id()}})
					if(result === undefined){return}
					replaceKeywordWithId('map', result, position, regex)
				},
				regex: /\/article=(\d+)+/i,
			},
		};

		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
		

		monaco.languages.registerCompletionItemProvider("markdown", {
			triggerCharacters: ["["],
			provideCompletionItems: function (model: any, position: any) {
			const text = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: position.column - 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column
			});

			if (text === "[") {
				return {
				suggestions: [
					{
					label: 'map',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: '](/map=)',
					documentation: 'Insert a map link',
					},
					{
					label: 'article',
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: '](/article=)',
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

		function highlightKeywords() {
			const model = editor.getModel();
			const text = model.getValue();
			let decorations: any[] = [];

			Object.entries(keywords).forEach(([keyword, {openModal, regex}]) => {

				let match = regex.exec(text);
				console.log(match)
				if (match !== null) {
					const start = match.index;
					const end = start + match[0].length;

					// Create decoration for this keyword match
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
			console.log('decorating')

			// Apply decorations and store their IDs
			decorationIds = editor.deltaDecorations(decorationIds, decorations);
		}


		editor.onMouseDown((event: any) => {
			const position = event.target.position;
			const decorationsAtPosition = editor.getDecorationsInRange(new monaco.Range(
				position.lineNumber, position.column, position.lineNumber, position.column
			));

			const clickedKeyword = decorationsAtPosition.find((deco: any) => deco.options.inlineClassName === 'keyword');
			
			if (clickedKeyword) {
				Object.entries(keywords).forEach(([keyword, value]) => {
					const lineContent = editor.getModel().getLineContent(position.lineNumber);
					const match = lineContent.match(value.regex);

					if (match) {
						value.openModal(position, value.regex)
					}
				});
			}
		});

		function replaceKeywordWithId(keyword: string, id: number, position: any, regex: RegExp) {
			const model = editor.getModel();
			const lineContent = model.getLineContent(position.lineNumber);
			const match = lineContent.match(regex)
			console.log(match)
			const startIndex = match.index;
			const endIndex = startIndex + match[0].length;
			

			// Create the replacement text: /keyword[id]{text}
			const newText = `/${keyword}=${id}`;

			// Replace the existing keyword in the editor
			const range = new monaco.Range(
			position.lineNumber, startIndex + 1,  // Start of the keyword
			position.lineNumber, endIndex + 1     // End of the {text}
			);

			editor.executeEdits("", [
			{ range, text: newText, forceMoveMarkers: true }
			]);

			highlightKeywords();
		}

		editor.onDidChangeModelContent(() => {
			store.article.content = editor.getValue();
			highlightKeywords();
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
