import { store } from "../store.svelte";
import type { Database } from "./database.types";
import dtb from "$lib/dtb"

export enum SearchParam {
	informatic_id = 'informatic'
}

export enum TargetType {
	Marker,
	Map,
	Informatic,
	Parent,
}

export type MarkerData = Database["public"]["Tables"]["marker"]["Row"];
export type MapData = Database["public"]["Tables"]["map"]["Row"];
export type Article = Database["public"]["Tables"]["article"]["Row"];
export type Project = Database["public"]["Tables"]["project"]["Row"];
export type Category = Database["public"]["Tables"]["category"]["Row"];

export type ModalEntity = {
	image: string | null;
	title: string;
	on_click: () => Promise<void> | void;
	background_image?: string | null;
	optional_func?: () => Promise<void> | void;
}

export type NodeEvent = 'toggle' | 'init' | 'zoom' | 'optional'

export type ModalName = 'upload_modal' | 'choose_modal' | 'confirm_modal' | 'composite_modal' | 'category_modal' | 'graph_modal' | 'filter_modal' | 'article_modal'

export type UploadModalInput<TState> = 
  | { type: 'text'; name: keyof TState & string; label?: string; placeholder?: string; required?: boolean; }
  | { type: 'file'; name: keyof TState & string; label?: string; accept?: string; required?: boolean; }
  | { type: 'button'; name: keyof TState & string; label?: string; on_click: (state: TState) => Promise<void>, display_text?: (state: TState) => string }
  | { type: 'number'; name: keyof TState & string; label?: string; placeholder?: string; required?: boolean; }

export type UploadModalData<TState> = {
  inputs: UploadModalInput<TState>[]; // List of inputs to render
  initial_state?: Partial<TState>; // Pre-fill values
  determine_preview?: (state: TState) => string | null; // Optional preview logic
  validation_func: (state: TState) => boolean; // Form validation
  submit_func: (state: TState) => Promise<void>; // Submission logic
  button_title: string; // Submit button text
};

export type UploadModalType<TState> = {
	type: "upload_modal";
	on_close?: (success: boolean) => void;
	data: UploadModalData<TState>;
}

export type MapUpload = {
	title: string,
	file: File | Blob | null,
	article_link: {id: number | null, title: string},
	scale: number | null
}

export type ImageUpload = {
	file: File | Blob | null
}

export type CategoryUpload = {
	title: string,
	theme: {id: number, title: string},
}

export type ConfirmModalData = {
	confirm_function: () => void;
	text: string;
}

export type ConfirmModalType = {
	type: "confirm_modal";
	on_close?: (success: boolean) => void;
	data: ConfirmModalData;
}

export type ChooseModalData= { [modal_tab: string]: ModalEntity[]; };


export type ChooseModalType = {
	type: 'choose_modal';
	on_close?: (success: boolean) => void;
	data: ChooseModalData;
	use_search: boolean;
}

export type SearchEntry = {
	on_click: () => void;
	title: string;
	image: string | null;
}

export type CompositeModalData = {[title: string]: ModalType}

export type GraphEntity = {
	children: number[],
	entity: ModalEntity
}

export type CategoryModalData = {
	child_id: number,
	parent_to_children_ids: {[parent_id: number]: number[]},
	add_child_to_parent: (parent_id: number) => Promise<void>,
	remove_child_from_parent: (parent_id: number) => Promise<void>,
	toggle_main_func: ((parent_id: number) => Promise<void>) | null,
	inverted?: boolean
}

export type GraphModalData = {
	graph_entities: {[id: number]: GraphEntity},
	head_id: number;
	modal_event?: {func: (id: number) => void, images: {[id: number]: string}};
}

export type FilterModalData = {
	graph_data: GraphModalData
	choose_data: {[choose_id: number]: ModalEntity}
	filter_link: {[graph_id: number]: number[]}
}

export type CompositeModalType = {
	type: 'composite_modal';
	on_close?: (success: boolean) => void;
	data: CompositeModalData;
}

export type CategoryModalType = {
	type: 'category_modal';
	data: CategoryModalData
	on_close?: (success: boolean) => void;
}

export type GraphModalType = {
	type: 'graph_modal';
	data: GraphModalData;
	on_close?: (success: boolean) => void;
	use_search: boolean;
}

export type FilterModalType = {
	type: 'filter_modal';
	data: FilterModalData;
	on_close?: (success: boolean) => void;
	use_search: boolean;
}

export type ArticleModalType = {
	type: 'article_modal';
	data: number;
	on_close?: (success: boolean) => void;
}


export type Folder = "maps" | "articles"
export type ModalType = ChooseModalType | UploadModalType<any> | ConfirmModalType | CompositeModalType | CategoryModalType | GraphModalType | FilterModalType | ArticleModalType