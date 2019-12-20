import { ReduxActions, AppState } from "../types"
import { FetchedHomework, HomeworkData, SelectedHomeworkType, HomeworkState } from "./types"
import serverRequest, { serverRequestGeneralParams } from "../../Backend";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { getISODateDay } from "../../Helpers/DateFormater";

export const setFetchedTopicalHomework = (topicalHomework: FetchedHomework) => {
    let knownSubjects = new Set<string>();
    
    for(let [, tasks] of Object.entries(topicalHomework)){
        for(let [, task] of Object.entries(tasks)) {
            knownSubjects.add(task.subject);
        }
    }
    
    return {
        type: ReduxActions.SET_FETCHED_TOPICAL_HOMEWORK,
        payload: {
            homework: topicalHomework,
            //@ts-ignore
            knownSubjects: [...knownSubjects.keys()]
        }
    }
}

export const setFetchedArchiveHomework = (homework: FetchedHomework) => {
    return {
        type: ReduxActions.SET_FETCHED_ARCHIVE_HOMEWORK,
        payload: {
            homework
        }
    }
}

export const resetFetchedHomework = () => {
    return {
        type: ReduxActions.RESET_FETCHED_HOMEWORK
    }
}

export const fetchNewHomework = (group_id: number, homeworkType: SelectedHomeworkType, fetchOptions?: serverRequestGeneralParams) => {
    return async dispatch => {
        let { hasError, homework } = await (homeworkType === "topical" ? serverRequest("homework.Get", {
                ...fetchOptions,
                group_id
            }) :
            serverRequest("homework.GetAll", {
                ...fetchOptions,
                group_id,
                offset: 0
            }));
        if(hasError)return null;
        if(homeworkType === "topical") dispatch(setFetchedTopicalHomework(homework));
        else if(homeworkType === "archive") dispatch(setFetchedArchiveHomework(homework));
        return homework;
    }
}

export const setArchiveHomeworkEndReached = (type: keyof HomeworkState["endReached"], endReached: boolean) => {
    return {
        type: ReduxActions.SET_END_REACHED,
        payload: {
            type,
            value: endReached
        }
    }
}

export const setSelectedHomeworkType = (selectedHomeworkType: SelectedHomeworkType) => {
    return {
        type: ReduxActions.SET_SELECTED_HOMEWORK_TYPE,
        payload: selectedHomeworkType
    }
}

export const fetchMoreHomeworkFromArchive = (group_id: number, fetchOptions?: serverRequestGeneralParams) => {
    return async (dispatch, getState) => {
        let state: AppState = getState();
        let currentOffset = state.homework.currentOffsets.archive;
        
        let { hasError, homework: newFetchedHomework } = await serverRequest("homework.GetAll", {
            ...fetchOptions,
            group_id,
            offset: currentOffset
        });

        if(hasError)return null;

        const debugLabel = "Parse fetched homework in archive section";
        
        console.time(debugLabel);

        let oldArchiveHomework = state.homework.cached.archive;

        
        Object.entries(newFetchedHomework).forEach(([day, tasks]) => {
            if(oldArchiveHomework[day]){
                oldArchiveHomework[day] = [...oldArchiveHomework[day], ...tasks];
            } else {
                oldArchiveHomework[day] = tasks;
            }
        });
        
        if(Object.keys(newFetchedHomework).length < 50){//todo: change this number
            dispatch(setArchiveHomeworkEndReached("archive", true));
        }

        dispatch({
            type: ReduxActions.SET_FETCHED_ARCHIVE_HOMEWORK,
            payload: {
                homework: oldArchiveHomework,
                offset: currentOffset + 1
            }
        })
        console.timeEnd(debugLabel);
    }
}

export const editHomeworkTask = (taskInfo: {task_id: number, subject: string, homework: string, date?: number | Date, files_id?: number[]}) => {
    return (dispatch, getState) => {
        let state: AppState = getState();
        let homework = state.homework.cached.topical;
        let taskNewDate = taskInfo.date ? getISODateDay(new Date(taskInfo.date)) : null;

        for(let [day, tasks] of Object.entries(homework)){
            for(let [i, task] of Object.entries(tasks)){
                if(task.task_id !== taskInfo.task_id)continue;
                if(taskNewDate && taskNewDate !== day){
                    removeHomeworkTask(task.task_id)(dispatch, getState, null);
                    appendHomeworkTask(taskInfo as any)(dispatch, getState, null);
                }else{
                    (homework[day][i] as HomeworkData) = {
                        task_id: taskInfo.task_id,
                        subject: taskInfo.subject,
                        homework: taskInfo.homework,
                        files: taskInfo.files_id || task.files
                    }
                    dispatch(setFetchedTopicalHomework(homework));
                }
            }
        }
    }
}

export const appendHomeworkTask = (taskInfo: { task_id: number, subject: string, homework: string, date: number | Date, files_id?: number[]}): ThunkAction<void, AppState, {}, AnyAction> => {
    return (dispatch, getState) => {
        let state: AppState = getState();
        let fetchedHomework = state.homework.cached.topical;
        let day = getISODateDay(new Date(taskInfo.date));

        let task: HomeworkData = {
            task_id: taskInfo.task_id,
            subject: taskInfo.subject,
            homework: taskInfo.homework,
            files: taskInfo.files_id || []
        };
        
        if(!fetchedHomework[day])fetchedHomework[day] = [];
        fetchedHomework[day].push(task);
        dispatch(setFetchedTopicalHomework(fetchedHomework));
    }
}

export const removeHomeworkTask = (task_id: number): ThunkAction<boolean, AppState, {}, AnyAction> => {
    return (dispatch, getState) => {
        let state = getState();
        let homework = state.homework.cached.topical;

        for(let [day, tasks] of Object.entries(homework)){
            for(let [i, task] of Object.entries(tasks)){
                if(task.task_id !== task_id)continue;
                homework[day].splice(+i, 1);
                if(homework[day].length === 0){
                    delete homework[day];
                }
                dispatch(setFetchedTopicalHomework(homework));
                return true;
            }
        }
        return false;
    }
}