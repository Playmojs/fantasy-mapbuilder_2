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

export type ModalEntity<TResult> = {
	image: string | null;
	title: string;
	on_result: () => TResult | void;
	on_reject?: () => void;
}

export type ModalType = 'upload_modal' | 'choose_modal' | 'confirm_modal'

export type UploadModalData<TResult> = {
	submit_func: (file: File | null, title: string, article_id: number | null) => TResult | void;
	validation_func: (file: File | Blob | null, title: string, article_id: number | null) => boolean;
	link_func: (() => Promise<number | null | undefined>) | null;
	button_title: string;
	initial_map_title: string | null;
	initial_image_blob: Blob | null;
	initial_link: number | null;
	allow_no_file: boolean;
};

export type UploadModal<TResult> = {
	type: "upload_modal";
	on_close?: (success: boolean) => void;
	data: UploadModalData<TResult>;
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

export type ChooseModalData<TResult> = { [modal_tab: string]: ModalEntity<TResult>[]; };


export type ChooseModal<TResult> = {
	type: 'choose_modal';
	on_close?: (success: boolean, result?: any) => void;
	data: ChooseModalData<TResult>;
}

export type SearchEntry = {
	on_click: () => void;
	title: string;
	img_src: string;
}


export type Folder = "maps" | "articles"
export type Modal<TResult> = ChooseModal<TResult> | UploadModal<TResult> | ConfirmModal