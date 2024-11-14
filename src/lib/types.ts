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
	optional_func?: () => Promise<void> | void;
}

export type NodeEvent = 'toggle' | 'init' | 'zoom'

export type ModalName = 'upload_modal' | 'choose_modal' | 'confirm_modal' | 'composite_modal' | 'category_modal' | 'graph_modal'

export type UploadModalData = {
	submit_func: (file: File | null, title: string, link_id: number | null) => Promise<void>;
	validation_func: (file: File | Blob | null, title: string, link_id: number | null) => boolean;
	link_func: ((value: {id: number | null, title: string}) => Promise<void>) | null;
	button_title: string;
	initial_map_title: string | null;
	initial_image_blob: Blob | null;
	initial_link: {id: number | null, title: string};
	allow_no_file: boolean | null; 
};

export type UploadModal = {
	type: "upload_modal";
	on_close?: (success: boolean) => void;
	data: UploadModalData;
}

export type ConfirmModalData = {
	confirm_function: () => void;
	text: string;
}

export type ConfirmModal = {
	type: "confirm_modal";
	on_close?: (success: boolean) => void;
	data: ConfirmModalData;
}

export type ChooseModalData= { [modal_tab: string]: ModalEntity[]; };


export type ChooseModal = {
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
	toggle_main_func: ((parent_id: number) => Promise<void>) | null
}

export type GraphModalData = {
	graph_entities: {[id: number]: GraphEntity},
	head_id: number;
}

export type CompositeModal = {
	type: 'composite_modal';
	on_close?: (success: boolean) => void;
	data: CompositeModalData;
}

export type CategoryModal = {
	type: 'category_modal';
	data: CategoryModalData
	on_close?: (success: boolean) => void;
}

export type GraphModal = {
	type: 'graph_modal';
	data: GraphModalData;
	on_close?: (success: boolean) => void;
	use_search: boolean;
}


export type Folder = "maps" | "articles"
export type ModalType = ChooseModal | UploadModal | ConfirmModal | CompositeModal | CategoryModal | GraphModal