export type GroupID = number;

export interface GroupInfo {
    group_id: GroupID,
    group_name: string,
    group_description: string
}

export interface GroupsState {
    savedGroups: GroupInfo[] | null,
    currentGroupId: GroupID | null,
    limitReached: boolean
}