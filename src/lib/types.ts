
export enum SearchParam {
	informatic_id = 'informatic'
}

export enum MarkerType {
	Informatic,
	Map,
}

export type MarkerData = {
	id: number;
	type: MarkerType;
	position: { x: number; y: number };
	image: string | null;
	query_id: number;
};

export type MapData = {
	id: number;
	image: string;
	parent_image: string | null;
	parent_id: number | null;
	marker_ids: number[];
	informatic_id: number;
};

export type Article = {
	id: number;
	text: string;
	article_image: string | null;
};