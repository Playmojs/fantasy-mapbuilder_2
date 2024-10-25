import { store } from "../store.svelte";
import { gotoMap } from "./goto_map";
import { choose_article_by_id, choose_existing_map, push_promise_modal } from "./modal_manager";

type Keyword = {
    choose_modal: () => Promise<number | void>;
    regex: RegExp;
    on_click: (id: number)=> void;
}

export const keywords: {[key: string] : Keyword} = {
    "map": {
        choose_modal: async()=>{
            const result: number | void = await push_promise_modal({type: 'choose_modal', data: {Maps: await choose_existing_map()}})
            return result
        },
        regex: /\/map=(\d*)+/g,
        on_click: (id: number)=>{gotoMap(id)}

    },
    "article": {
        choose_modal: async()=>{
            const result: number | void = await push_promise_modal({type: 'choose_modal', data: {Articles: await choose_article_by_id()}})
            return result
        },
        regex: /\/article=(\d*)+/g,
        on_click: (id: number)=>{store.article_history.push(id)}
    },
};