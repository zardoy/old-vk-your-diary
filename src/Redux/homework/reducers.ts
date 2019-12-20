import { HomeworkState } from "./types";
import { ReduxActions } from "../types";

const initialState: HomeworkState = {
    cached: {
        topical: null,
        archive: null
    },
    knownSubjects: [],
    currentOffsets: {
        archive: 0,
        searchArchive: 0
    },
    selectedHomeworkType: "topical",
    endReached: {
        archive: false,
        searchArchive: false
    }
}

export default (state = initialState, action): HomeworkState => {
    let { payload } = action;
    switch(action.type){
        case ReduxActions.SET_FETCHED_TOPICAL_HOMEWORK:
            return {...state, cached: {
                ...state.cached,
                topical: payload.homework
            }, knownSubjects: payload.knownSubjects}
        case ReduxActions.SET_FETCHED_ARCHIVE_HOMEWORK:
            return {
                ...state, 
                cached: {
                    ...state.cached,
                    archive: payload.homework
                },
                currentOffsets: {
                    ...state.currentOffsets,
                    archive: payload.offset
                }
            }
        case ReduxActions.SET_END_REACHED:
            return {...state, endReached: {
                ...state.endReached,
                [payload.type]: payload.value
            }}
        case ReduxActions.SET_SELECTED_HOMEWORK_TYPE: 
            return {...state, selectedHomeworkType: payload}
        case ReduxActions.RESET_FETCHED_HOMEWORK:
            return initialState;
        default:
            return state;
    }
}