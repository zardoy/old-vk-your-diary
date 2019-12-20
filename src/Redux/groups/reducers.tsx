import { GroupsState } from "./types";
import { ReduxActions } from "../types";

const initialState: GroupsState = {
    savedGroups: null,
    currentGroupId: null,
    limitReached: false
}

export default (state = initialState, action): GroupsState => {
    let { payload } = action;
    
    switch(action.type){
        case ReduxActions.SET_FETCHED_GROUPS:
            return {...state, savedGroups: payload}
        case ReduxActions.SET_GROUP_INFO:
            let { savedGroups } = state;
            for(let [i, group] of Object.entries(savedGroups)){
                if(group.group_id === payload.group_id){
                    savedGroups[i] = payload;
                }
            }
            return {...state, savedGroups: savedGroups.slice()};
        case ReduxActions.DELETE_SAVED_GROUP:
            let { savedGroups:groups } = state;
            for(let [i, group] of Object.entries(groups)){
                if(group.group_id === payload){
                    groups.splice(+i, 1);
                }
            }
            return {...state, savedGroups: groups};
        case ReduxActions.SET_CURRENT_GROUP_ID:
            return {...state, currentGroupId: payload}
        case ReduxActions.SET_GROUPS_LIMIT_REACHED:
            return {...state, limitReached: !!payload}
        default:
            return state;
    }
}