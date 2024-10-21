import { store } from '../store.svelte';
import dtb from './dtb';
import type { ChooseModalData, Modal, ModalEntity, UploadModal } from './types';
import { assert_unreachable } from './utils';


export function push_modal(modal: Modal<void>): void {store.modals = [...store.modals, modal]}

export function pop_modal(): void {store.modals = store.modals.slice(0, -1)} // TODO: I think this copies the list - can this be avoided?

export function push_promise_modal<TResult>(modal: Modal<TResult>): Promise<TResult | void> {
    return new Promise((resolve, reject) => {
        modal.on_close = (success: boolean, result?: TResult) => {
            if (success && result !== undefined) {
                resolve(result);
            } else if (success) {
                resolve()
            } else {
                reject();
            }
        };
        store.modals = [...store.modals, modal]
    });
};

export const choose_article_by_id: () => ModalEntity<number>[] = () => {
    return Object.entries(store.article_cache).map(([id, article]) => {
        return {
            image:
                article.image && store.image_public_urls[article.image]
                    ? URL.createObjectURL(store.image_public_urls[article.image])
                    : '/assets/article_icon.png',
            title: article.title,
            on_result: () => {
                return article.id;
            }
        };
    });
};

export const choose_existing_map: () => Promise<ModalEntity<number>[]> = async () => {
    await dtb.fetch_all_from_project(store.project_id);
    return Object.entries(store.map_cache).map(([_, map]) => {
        return {
            image: URL.createObjectURL(store.image_public_urls[map.image]),
            title: map.title,
            on_result: () => {
                return map.id
            }
        };
    });
};

export const add_article: ModalEntity<void> =
{
	image: "/assets/plus.png",
	title: "Add Article",
	on_result: async () => { 
        const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
        if (selected_marker === undefined) {
            assert_unreachable("Selected marker doesn't exist");
            return;
        } 

        const response = await dtb.create_and_show_article();

        if (response !== undefined) {
            selected_marker.target_article_id = +response.id;
            selected_marker.target_map_id = null;
            dtb.update_marker(selected_marker);
        }}
}

export const choose_no_article: ModalEntity<null | number> =
{
	image: "/assets/minus.png",
	title: "Don't Link To Article",
	on_result: () => { return null; }
}

export const link_article: () => Promise<number | null | undefined> = async () => {
    const result = await push_promise_modal<number | null>({
        type: 'choose_modal',
        data: { Articles: [choose_no_article].concat(choose_article_by_id()) }
    });
    if (typeof result === 'number' || result === null) {
        return result;
    }
}

export const get_new_map_data: () => Promise<void | {file: File | null, title: string, article_id: number | null}> = () => {
    let modal: UploadModal<{file: File | null, title: string, article_id: number | null}> = {type: 'upload_modal',
        data: {
            submit_func: (file: File | null, title: string, article_id: number | null) => {
                if(file === null || title === ''){return}
                else{return {file, title, article_id}}
            },
            validation_func(file: Blob | File | null, title: string) {
                return file !== null && title !== '';
            },
            link_func: link_article,
            button_title: 'Create Map',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: null,
            allow_no_file: false}};

    return push_promise_modal(modal)
}

export type map_or_article = {
    article_id: number | null;
    map_id: number | null;
}

export const choose_map_or_article: () => ChooseModalData<map_or_article> = () => {
    return{
        Maps:  Object.entries(store.map_cache).map(([_, map]) => {
            return {
                image: URL.createObjectURL(store.image_public_urls[map.image]),
                title: map.title,
                on_result: () => {
                    return {article_id: null, map_id: map.id}
                }
            };
        }),
        Articles: Object.entries(store.article_cache).map(([_, article]) => {
            return {
                image:
                    article.image && store.image_public_urls[article.image]
                        ? URL.createObjectURL(store.image_public_urls[article.image])
                        : '/assets/article_icon.png',
                title: article.title,
                on_result: () => {
                    return {article_id: article.id, map_id: null}
                }
            };
        })
    }
}