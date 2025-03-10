
import { store } from '../store.svelte';
import { get_modal_entity_themes, theme_entities, units } from './data.svelte';
import dtb from './dtb';
import type { ChooseModalData, ModalType, ModalEntity, UploadModalType, CategoryModalData, Category, CompositeModalType, MapUpload, CategoryUpload, ChooseModalType, ImageUpload } from './types';
import { assert_unreachable} from './utils';


export function push_modal(modal: ModalType): void {store.modals = [...store.modals, modal]}

export function pop_modal(): void {store.modals = store.modals.slice(0, -1)} // TODO: I think this copies the list - can this be avoided?

export function push_promise_modal(modal: ModalType): Promise<void> {
    return new Promise((resolve, reject) => {
        modal.on_close = (success: boolean) => {
            if (success) {
                resolve()
            } else {
                reject();
            }
        };
        store.modals = [...store.modals, modal]
    });
};

export const choose_article_by_id: (value: {id: number | null, title: string}) => ModalEntity[] = (value) => {
    return Object.values(store.article_cache).map((article) => {
        return {
            image:
                article.image && store.image_public_urls[article.image]
                    ? URL.createObjectURL(store.image_public_urls[article.image])
                    : '/assets/Parchment.png',
            title: article.title,
            on_click: () => {
                value.id = article.id;
                value.title = article.title;
            }
        };
    });
};

export const choose_existing_map: (value: {id: number | null}) => Promise<ModalEntity[]> = async (value) => {
    await dtb.fetch_all_from_project(store.project_id);
    return Object.values(store.map_cache).map((map) => {
        return {
            image: URL.createObjectURL(store.image_public_urls[map.image]),
            title: map.title,
            on_click: () => {
                value.id = map.id
            }
        };
    });
};

export const add_and_choose_article: (value: {id: number | null, title: string}) => ModalEntity = (value) =>
{
    return {
        image: "/assets/plus.png",
        title: "Add Article",
        on_click: async () => {
            const data = await dtb.create_article(store.project_id);
            if(!data){return}
            value.id = data.id;
            value.title = data.title;
        }
    }
}

export const add_article_to_marker: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Article",
	on_click: async () => { 
        const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
        if (selected_marker === undefined) {
            assert_unreachable("Selected marker doesn't exist");
            return;
        } 

        const response = await dtb.create_and_show_article(store.project_id);

        if (response !== undefined) {
            selected_marker.target_article_id = +response.id;
            selected_marker.target_map_id = null;
            dtb.update_marker(selected_marker);
        }}
}

// export const add_article_by_id: (value: {id: number | null, title: string}) => ModalEntity = (value) => {return{
//     image: "/assets/fantasy_plus.png",
//     title: "New Article",
//     on_click: async() => {

//     }
//     }
// }

export const choose_no_article: (value: {id: null | number}) => ModalEntity = (value) => {
    return{
        image: "/assets/minus.png",
        title: "Don't Link To Article",
        on_click: () => { value.id = null; }
    }
}

export const link_article: (value: {id: number | null, title: string}) => Promise<void> = async (value) => {
    await push_promise_modal({
        type: 'choose_modal',
        data: { Articles: [choose_no_article(value)].concat(choose_article_by_id(value))},
        use_search: true
    });
}

export const get_new_map_data: (value: {file: File | null, title: string, article_id: number | null, scale: number | null}) => Promise<void> = (value) => {
    const modal: UploadModalType<MapUpload> = {type: 'upload_modal',
        data: {
            inputs: [
                {type: 'text', name: 'title', label: 'Title', required: true },
                {type: 'file', name: 'file', label: 'Upload File', required: true},
                {type: 'button', name: 'article_link', label: 'Link Article', on_click: async (state) => {
                    const value: {id: number | null, title: string} = {id: null, title: ''};
                    await link_article(value);
                    state.article_link = value;
                },
                display_text(state){return (state.article_link && state.article_link.id !== null) ? state.article_link.title : 'No Article Link'}},
                {type: 'number', name: 'scale', label: 'Map Scale', required: false, unit: {units: Object.values(units).map(unit => {return {id: unit.id, name: unit.name}}), on_click(state, value) {
                    state.unit_id = value
                }}}
            ],
            initial_state: {file: null, title: '', article_link: {id: null, title: ''}, scale: null, unit_id: 0},
            validation_func: (state) => {
                return state.file !== null && state.title !== '';
            },
            submit_func: async (state) => {
                if(!(state.file instanceof File) || state.title === ''){
                    assert_unreachable('Tried to commit map with insufficient data')
                    return
                }
                value.file = state.file;
                value.title = state.title;
                value.article_id = state.article_link.id;
                value.scale = state.scale !== null ? state.scale * (state.unit_id ? units[state.unit_id].factor: 1) : state.scale;
            },
            determine_preview(state) {
                if(state.file === null){return null}
                return URL.createObjectURL(state.file)
            },
            button_title: 'Create Map'
        }
    }

    return push_promise_modal(modal)
}

export type map_or_article = {
    article_id: number | null;
    map_id: number | null;
}

export const choose_map_or_article: (value: {map_id: number | null, article_id: number| null}) => ChooseModalData = (value) => {
    return{
        Maps:  Object.values(store.map_cache).map((map) => {
            return {
                image: URL.createObjectURL(store.image_public_urls[map.image]),
                title: map.title,
                on_click: () => {
                    value.map_id = map.id
                    value.article_id = null
                }
            };
        }),
        Articles: Object.values(store.article_cache).map((article) => {
            return {
                image:
                    article.image && store.image_public_urls[article.image]
                        ? URL.createObjectURL(store.image_public_urls[article.image])
                        : '/assets/Parchment.png',
                title: article.title,
                on_click: () => {
                    value.map_id = null;
                    value.article_id = article.id;
                }
            };
        })
    }
}

export const get_article_to_category_modal: (article_id: number) => CategoryModalData = (article_id: number) => {
    return {
        child_id: article_id,
        parent_to_children_ids: store.article_category_links,
        add_child_to_parent: (category_id: number) => {return dtb.insert_article_category_link(store.project_id, category_id, article_id)},
        remove_child_from_parent: (category_id: number) => {return dtb.delete_article_category_link(store.project_id, category_id, article_id)},
        async toggle_main_func(parent_id) {
            const article = await dtb.get_article(store.project_id, article_id);
            if(!article){return;}
            const new_main_category_id: number | null = parent_id === article.main_category ? null : parent_id;
            article.main_category = new_main_category_id;
            dtb.update_article(article);
        },
    }
}

export const get_category_to_category_modal: (child_category_id: number) => CategoryModalData = (child_category_id: number) => {
    return {
        child_id: child_category_id,
        parent_to_children_ids: store.category_links,
        add_child_to_parent: (parent_category_id: number) => {return dtb.insert_category_link (store.project_id, parent_category_id, child_category_id)},
        remove_child_from_parent: (parent_category_id: number) => {return dtb.delete_category_link (store.project_id, parent_category_id, child_category_id)},
        toggle_main_func: null
    }
}



export const get_inverse_category_to_category_modal: (parent_category_id: number) => CategoryModalData = (parent_category_id: number) => {
    return {
        child_id: parent_category_id,
        parent_to_children_ids: store.category_links,
        add_child_to_parent: (child_category_id: number) => {return dtb.insert_category_link(store.project_id, parent_category_id, child_category_id)},
        remove_child_from_parent: (child_category_id: number) => {return dtb.delete_category_link(store.project_id, parent_category_id, child_category_id)},
        toggle_main_func: null,
        inverted: true
    }
}

export const get_add_category_modal: (value: {id: number | null}) => UploadModalType<CategoryUpload> = (value) => {
    return {type: 'upload_modal',
        data: {
            inputs: [
                {type: 'text', name: 'title', label: 'Category Title', required: true},
                {type: 'button', name: 'theme', label: 'Select Theme', on_click: async (state) => {
                    const theme: {id: number, title: string} = {id: state.theme.id, title: state.theme.title}
                    await push_promise_modal({type:'choose_modal', data: {Themes: get_modal_entity_themes(theme)}, use_search: true})
                    state.theme = theme;
                },
                display_text(state) {
                    return(state.theme.title)
                },
            }
            ],
            initial_state: {theme: {id: 0, title: theme_entities[0].title}, title: ''},
            validation_func: (state) => {return !!state.title},
            submit_func: async(state) => {
                const response = await dtb.create_category(store.project_id, state.title, state.theme.id)
                if (response !== undefined){
                    value.id = response.id;
                }
            },
            determine_preview(state) {
                return(theme_entities[state.theme.id].image)
            },
            button_title: 'Create Category'
        }};
}


export const edit_category_modal: (category: Category) => UploadModalType<CategoryUpload> = (category: Category) => {
    return {type: 'upload_modal',
        data: {
            inputs: [
                {type: 'text', name: 'title', label: 'Category Title', required: true},
                {type: 'button', name: 'theme', label: 'Select Theme', on_click: async (state) => {
                    const theme: {id: number, title: string} = {id: state.theme.id, title: state.theme.title}
                    await push_promise_modal({type:'choose_modal', data: {Themes: get_modal_entity_themes(theme)}, use_search: true})
                    state.theme = theme;
                },
                display_text(state){
                    return(state.theme.title)
                }}
            ],
            initial_state: {title: category.name, theme: {id: category.theme_id, title: theme_entities[category.theme_id].title}},
            validation_func: (state) => {return !!state.title && (state.title != category.name || state.theme.id !== category.theme_id)},
            submit_func: async(state) => {
                if(state.title === '' || state.title === 'Add Category'){return}
                category.name = state.title;
                category.theme_id = state.theme.id ?? 0
                await dtb.update_category(category)
            },
            determine_preview(state) {
                return(theme_entities[state.theme.id].image)
            },
            button_title: 'Update Category'
        }};
 }

 export const get_composite_category_modal: (category: Category) => CompositeModalType = (category: Category) => {
    return({
        type: 'composite_modal',
        data: {
            'Category Data': edit_category_modal(category),
            'Parent Categories': {type: 'category_modal', data: get_category_to_category_modal(category.id)},
            'Child Categories': {type: 'category_modal', data: get_inverse_category_to_category_modal(category.id)}
        }
    })
 }

 export const get_choose_category_to_edit_modal: () => ChooseModalType = () => {
    return {
        type: 'choose_modal',
        use_search: true,
        data: {
            Categories: [{
                image: null,
                title: 'Add Category',
                on_click: async ()=>{
                    await push_promise_modal(get_add_category_modal({id: null}))}
            }].concat(Object.values(store.category_cache)
                .map(category => {return {
                    image: null, 
                    title: category.name,
                    on_click: async ()=> {await push_promise_modal(get_composite_category_modal(category))},
                    background_image: theme_entities[category.theme_id].image
                    }}))
        }
    }
 }

 export const get_article_image_modal: (article_id: number) => UploadModalType<ImageUpload> = (article_id: number) => {
    const article = {...store.article_cache[article_id]};
    return {
        type: 'upload_modal',
        data: {	
            inputs: [
                {type: 'file', name: 'file', label: 'Article Image', required: false}
            ],
            initial_state: {file: article.image ? store.image_public_urls[article.image] : null},
            validation_func: (state) => {
                return (article.image === null && state.file !== null) || (article.image !== null && store.image_public_urls[article.image] !== state.file)
            },
            submit_func: async (state) => {
                if (!(state.file instanceof File) && state.file !== null){
                    assert_unreachable('Try to submit false')
                    return
                }
                if (state.file === null){
                    article.image = null;
                }
                else{
                    const image_id = await dtb.upload_image(store.project_id, state.file, 'articles', null)
                    if(!image_id){
                        console.error("Image upload failed");
                        return;
                    }
                    store.image_public_urls[image_id] = state.file;
                    article.image = image_id;
                }	
                await dtb.update_article(article);
                return;
            },
            determine_preview(state) {
                return(state.file !== null ? URL.createObjectURL(state.file) : null)
            },
            button_title: 'Update Article Image'
        }
    }
}

export function get_article_options(article_id: number): CompositeModalType{
    return {
        type: 'composite_modal',
        data: {
            'Article Image': get_article_image_modal(article_id),
            'Categories': {type: 'category_modal', data: get_article_to_category_modal(article_id)}
        }
    }
}

export const get_filtered_choose_category_modal: (article_id: number, categories: Category[]) => Promise<void> = async (article_id, categories) => {
    // Consider making this not hardcoded to article-to-category?
    const add_category: ModalEntity = {image: null, title: 'New Category', on_click: async () => {
        const value: {id: number | null} = {id: null};
        await push_promise_modal(get_add_category_modal(value));
        if(value.id !== null){
            await dtb.insert_article_category_link(store.project_id, value.id, article_id)
        }
    }}

    const modal_entities: ModalEntity[] = [add_category].concat(Object.values(store.category_cache)
        .filter((category) => {return !categories.includes(category)})
        .map((category)=>{return {image: null, title: category.name, background_image: theme_entities[category.theme_id].image, on_click: async () => {await dtb.insert_article_category_link(store.project_id, category.id, article_id)}, optional_func: ()=>{push_modal(get_composite_category_modal({...category}))}}}))
    push_promise_modal({type: 'choose_modal', data: {Categories: modal_entities}, use_search: true})
}