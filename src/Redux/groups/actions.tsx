import { GroupInfo } from "./types";
import { ReduxActions } from "../types";
import { vkStorageSet, VKStorageKeys } from "../../Helpers/VKStorage";

export const setGroupsInfo = (groupsInfo: GroupInfo[], limitReached?: boolean) => {
    return dispatch => {
        if(typeof limitReached !== "undefined") dispatch(setGroupsLimitReached(limitReached));
        dispatch({
            type: ReduxActions.SET_FETCHED_GROUPS,
            payload: groupsInfo
        });
    }
}

export const setCurrentGroupId = (groupId: number | null, writeToVkStorage = true) => {
    if(groupId !== null && writeToVkStorage)vkStorageSet(VKStorageKeys.CURRENT_GROUP_ID, String(groupId));
    return {
        type: ReduxActions.SET_CURRENT_GROUP_ID,
        payload: groupId
    }
}

export const setGroupsLimitReached = (limitReached: boolean) => {
    return {
        type: ReduxActions.SET_GROUPS_LIMIT_REACHED,
        payload: limitReached
    }
}

export const deleteSavedGroup = (groupId: number) => {
    return {
        type: ReduxActions.DELETE_SAVED_GROUP,
        payload: groupId
    }
}

export const setGroupInfo = (groupInfo: GroupInfo) => {
    return {
        type: ReduxActions.SET_GROUP_INFO,
        payload: groupInfo
    }
}