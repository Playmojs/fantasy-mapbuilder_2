import { store } from '../store.svelte';
import type { Modal, ModalEntity } from './types';

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
