export const assert = (condition: boolean, message: string) => {
    if (!condition) {
        console.error(message);
        console.trace();
    }
}

export const assert_unreachable = (message: string) => {
    assert(false, message);
}