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
	ParentMap
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
}

export type ModalType = 'upload_modal' | 'choose_modal' | 'confirm_modal'

export type UploadModalData = {
	submit_func: (file: File | null, title: string, article_id: number | null) => void;
	validation_func: (file: File | Blob | null, title: string, article_id: number | null) => boolean;
	link_func: ((value: {id: number | null}) => Promise<void>) | null;
	button_title: string;
	initial_map_title: string | null;
	initial_image_blob: Blob | null;
	initial_link: number | null;
	allow_no_file: boolean;
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

export type CompositeModalData = {[title: string]: Modal}

export type CompositeModal = {
	type: 'composite_modal';
	on_close?: (success: boolean) => void;
	data: CompositeModalData;
}


export type Folder = "maps" | "articles"
export type Modal = ChooseModal | UploadModal | ConfirmModal | CompositeModal