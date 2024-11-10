import { store } from "../store.svelte";
import { push_article } from "./article_stack";
import { gotoMap } from "./goto_map";
import { choose_article_by_id, choose_existing_map, push_promise_modal } from "./modal_manager";

type Keyword = {
    choose_modal: (value: any) => Promise<number | void>;
    regex: RegExp;
    on_click: (id: number)=> void;
}

export const keywords: {[key: string] : Keyword} = {
    "map": {
        choose_modal: async(value: {id: number | null})=>{
            await push_promise_modal({type: 'choose_modal', data: {Maps: await choose_existing_map(value)}, use_search: true})
        },
        regex: /\/map=(\d*)+/g,
        on_click: (id: number)=>{gotoMap(id)}

    },
    "article": {
        choose_modal: async(value: {id: number | null})=>{
            await push_promise_modal({type: 'choose_modal', data: {Articles: await choose_article_by_id(value)}, use_search: true})
        },
        regex: /\/article=(\d*)+/g,
        on_click: (id: number)=>{push_article(id, false)}
    },
};