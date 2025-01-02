import { get_updated_content } from "../components/Informatic.svelte";
import { store } from "../store.svelte";
import dtb from "./dtb";
import type { Article } from "./types";
import { assert, assert_unreachable } from "./utils";

let replace_head: boolean = false;

function synchronize_current_article_content(){
    const prev_id = store.article_history.at(-1);
    if(store.edit_mode && prev_id !== undefined){
        const article_info = get_updated_content()
        if (prev_id !== article_info.id || prev_id < 0){return}
        dtb.update_article({...store.article_cache[prev_id], content: article_info.content})
    }
}

export function push_article(id: number, is_replaced: boolean){
    let prev_id = store.article_history.at(-1)
    if(store.edit_mode){synchronize_current_article_content()}
    if (replace_head){pop_article()}
    if(!is_replaced){store.article_history = store.article_history.filter(val => {return val !== id})}
    store.article_history.push(id)
    replace_head = is_replaced;
    store.undone_articles = [];
}

export async function pop_article(){
    if (store.edit_mode){
        synchronize_current_article_content()}
    const current_id = store.article_history.pop();
    if(current_id === undefined){
        console.error('Invalid pop of article history');
        return;
    }
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
    if(store.edit_mode){synchronize_current_article_content()}
    store.article_history.push(attempt_id);
}