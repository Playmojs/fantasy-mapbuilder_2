import { store } from "../store.svelte";
import dtb from "./dtb";
import type { Article } from "./types";
import { assert, assert_unreachable } from "./utils";

let replace_head: boolean = false;

export function push_article(id: number, is_replaced: boolean){
    if(store.edit_mode && store.article_history.at(-1)){dtb.update_article(store.article)}
    if (replace_head){pop_article()}
    if(!is_replaced){store.article_history = store.article_history.filter(val => {return val !== id})}
    store.article_history.push(id)
    replace_head = is_replaced;
    store.undone_articles = [];
}

export async function pop_article(){
    const current_id = store.article_history.pop();
    if(current_id === undefined){
        console.error('Invalid pop of article history');
        return;
    }
    if (store.edit_mode){dtb.update_article(store.article_cache[current_id])}
    const validated = await validate_article_pop();
    if (!validated){
        store.article_history.push(current_id);
        return;
    }
    store.undone_articles.push(current_id);
}

async function validate_article_pop(): Promise<boolean>{
    const attempt_id = store.article_history.at(-1);
    if(store.article_history.length === 0 || attempt_id === undefined){
        console.error('Try to pop empty article history');
        return false
    }
    if(!await dtb.get_article(store.project_id, attempt_id)){
        store.article_history.pop();
        return await validate_article_pop();
    }
    return true;
}

export async function undo_article_pop(){
    const attempt_id = store.undone_articles.pop()
    if (attempt_id === undefined){
        console.error('No undone articles, cannot redo');
        return;
    }
    if (!await dtb.get_article(store.project_id, attempt_id)){
        undo_article_pop();
    }
    store.article_history.push(attempt_id);
}