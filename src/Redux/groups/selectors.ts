import { AppState } from "../types";
import { GroupInfo } from "./types";

export function getSelectedGroupInfo(state: AppState): GroupInfo {
    let currentGroupId = state.groups.currentGroupId;
    return state.groups.savedGroups.find(groupInfo => (
        groupInfo.group_id === currentGroupId
    )) || {
        group_id: null,
        group_name: null,
        group_description: null
    };
}