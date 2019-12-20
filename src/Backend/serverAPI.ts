import { GroupID } from "../Redux/groups/types";
import { TaskID, FetchedHomework } from "../Redux/homework/types";

export type RecievedHomeworkDataFromServer = {
    task_id: TaskID,
    subject: string,
    homework: string,
    date: number,
    files: number[]
}[]

export interface ServerRequestData {
    "homework.GetAll": {
        postParams: {
            group_id: GroupID,
            offset: number
        },
        responseServerData: RecievedHomeworkDataFromServer,
        responseData: {
            homework: FetchedHomework
        }
    },
    "homework.Get": {
        postParams: {
            group_id: GroupID
        },
        responseServerData: RecievedHomeworkDataFromServer,
        responseData: {
            homework: FetchedHomework
        }
    },
    "homework.Search": {
        postParams: {
            group_id: GroupID,
            query: string,
            offset: number
        },
        responseServerData: RecievedHomeworkDataFromServer,
        responseData: {
            homework: FetchedHomework
        }
    },
    "homework.Add":{
        params: {
            subject: string,
            homework: string,
            date: Date,
            group_id: number,
            files_id?: number[]
        },
        postParams: {
            subject: string,
            homework: string,
            date: number,
            group_id: number,
            files?: string
        },
        responseData: {
            task_id: number
        }
    },
    "homework.Delete":{
        postParams: {
            task_id: number,
            group_id: number
        }
    },
    "homework.Edit":{
        params: {
            task_id: number,
            subject: string,
            homework: string,
            group_id: number,
            date?: Date,
            files_id?: number[]
        }
        postParams: {
            id: TaskID,
            subject: string,
            homework: string,
            group_id: number,
            date?: number,
            files?: string
        }
    },
    "group.Join":{
        postParams: {
            token: string
        },
        responseData: {
            group_id: GroupID
        }
    },
    "group.Leave":{
        postParams: {
            group_id: GroupID
        }
    },
    "group.Create":{
        responseData: {
            group_id: GroupID
        }
    },
    "group.NewToken":{
        postParams: {
            group_id: GroupID
        }
    },
    "group.GetToken":{
        postParams: {
            group_id: GroupID
        },
        responseData: {
            token: string
        }
    },
    "group.GetQR":{
        postParams: {
            group_id: number
        }
    },
    "group.GetInfo":{
        postParams: {
            group_id: GroupID
        },
        responseData: {
            name: string,
            description: string
        }
    },
    "group.GetInfoByToken": {
        postParams: {
            token: number
        },
        responseData: {
            name: string,
            description: string
        }
    }
    "group.SetName": {
        postParams: {
            group_id: number,
            group_name: string
        }
    },
    "group.SetDescription":{
        postParams: {
            group_id: number,
            group_description: string
        }
    },
    "auth.Check":{},
    "user.Register":{},
    "user.GetGroups":{
        responseData: {
            groups: {
                group_id: number,
                group_name: string,
                group_description: string
            }[],
            limitReached: boolean
        }
    },
    "file.Get":{
        postParams: {
            group_id: number,
            file_id: number
        },
        responseData: {
            file: any//TODO
        }
    },
    "file.Upload": {
    },
    "file.GetInfo":{
        postParams: {
            group_id: number,
            file_id: number
        },
        responseData: {
            file_name: string,
            file_size: number,
            file_id: number,
            group_id: number
        }
    },
    "error":{
        postParams: {
            text: string
        }
    }
}