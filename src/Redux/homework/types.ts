export type TaskID = number

export interface HomeworkData {
    subject: string,
    homework: string,
    task_id: TaskID,
    files: number[]
}

export interface FetchedHomework {
    [date: string]: HomeworkData[]
}

export type SelectedHomeworkType = "topical" | "archive";

export interface HomeworkState {
    cached: {
        topical: FetchedHomework | null,
        archive: FetchedHomework | null
    },
    currentOffsets: {
        archive: number,
        searchArchive: number
    },
    endReached: {
        archive: boolean,
        searchArchive: boolean
    },
    selectedHomeworkType: SelectedHomeworkType,
    knownSubjects: string[]
}
