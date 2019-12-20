import { useEffect, useState, useCallback } from "react"

type DoneFunc = () => void;

const useF7Ptr = (onRefresh: (done: DoneFunc) => any): [boolean, (doneFunc: DoneFunc) => any] => {
    let [ptrDoneFunc, setPtrDoneFunc] = useState(null as any);
    
    useEffect(() => {
        if (!ptrDoneFunc) return;
        return onRefresh(() => {
            ptrDoneFunc();
            setPtrDoneFunc(null);
        });
    }, [ ptrDoneFunc ]);

    let isFetchingPtr = !!ptrDoneFunc;

    return [isFetchingPtr, (doneFunc) => {
        setPtrDoneFunc(() => doneFunc);
    }];
}

const useF7PopoutControl = (initialState: boolean): [boolean, (...args) => any, (...args) => any] => {
    let [f7PopoutOpened, setF7PopoutOpened] = useState(initialState);
    return [f7PopoutOpened, useCallback(() => setF7PopoutOpened(true), []), useCallback(() => setF7PopoutOpened(false), [])]
}

export { useF7Ptr, useF7PopoutControl };