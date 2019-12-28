import { FetchedHomework, TaskID } from "../Redux/homework/types";
import { ServerRequestData, RecievedHomeworkDataFromServer } from "./serverAPI";
import { ServerError } from ".";
import serverRequest, { GetServerRequestParams } from "./serverRequest";
import { getVKParam } from "../Helpers/URLParams";
import Framework7 from "framework7";
import vkConnect from "@vkontakte/vk-connect/";

export type GetServerRequestPostParams<T extends keyof ServerRequestData> = ServerRequestData[T] extends { postParams: infer U } ? U : {};

export type GetServerRequestResponseData<T extends keyof ServerRequestData> = ServerRequestData[T] extends { responseData: infer U } ? U : {};

const homeworkParser = (homeworkFromServer: RecievedHomeworkDataFromServer): { homework: FetchedHomework } => {
    let homework: FetchedHomework = {};
    homeworkFromServer.forEach(task => {
        let day = new Date((+task.date) * 1000).toISOString().slice(0, 10);
        delete task.date;
        if (!(day in homework)) homework[day] = [];
        homework[day].push(task);
    });
    return { homework };
};

type GetResponseServerData<T extends keyof ServerRequestData> = ServerRequestData[T] extends { responseServerData: infer U } ? U : {};

type OtherRequestEnhancersType = {//where is required
    [methodName in keyof ServerRequestData]?: {
        handleErrors?: (err: Error | ServerError) => { hasError: true, err: Error },
        parseReceivedData?: (responseData: GetResponseServerData<methodName>) => GetServerRequestResponseData<methodName>
    }
}

export let otherMethodsEnhancers: OtherRequestEnhancersType = {//require parse
    "homework.Get": {
        parseReceivedData: homeworkParser
    },
    "homework.GetAll": {
        parseReceivedData: homeworkParser
    },
    "homework.Search": {
        parseReceivedData: homeworkParser
    }
}

type MethodRequestParamsMaps = {
    [methodName in keyof ServerRequestData]?: (options: GetServerRequestParams<methodName>) => GetServerRequestPostParams<methodName>
}

const methodMapOffset = (options) => ({
    ...options,
    offset: options.offset * 50 + 1
})

export let requestParamsMaps: MethodRequestParamsMaps = {
    "homework.Add": ({ date, files_id, group_id, subject, homework }) => ({
        date: Math.floor(new Date(date).valueOf() / 1000),
        files: files_id ? files_id.join(",") : null,
        group_id,
        homework,
        subject
    }),
    "homework.Edit": ({ group_id, task_id, subject, homework, date, files_id }) => ({
        id: task_id,
        date: date ? Math.floor(new Date(date).valueOf() / 1000) : null,
        files: files_id ? files_id.join(",") : null,
        group_id,
        homework,
        subject
    }),
    "homework.GetAll": methodMapOffset,
    "homework.Search": methodMapOffset,
};

export function logApplicationErrorToServer(errorObj: Error, additionalInfo?: string) {
    vkConnect.send("VKWebAppTapticNotificationOccurred", { "type": "error" });
    let vkPlatform = getVKParam("platform") || "notVK";
    let platformInfo = `${Framework7.device.os} ${Framework7.device.osVersion || ""} (${vkPlatform})`;
    let errorMessage = `${JSON.stringify(errorObj)}::${errorObj.stack}`;
    let messageToServer = `${additionalInfo} \n${platformInfo}: ${errorMessage}`;
    console.log("Report Error: " + messageToServer);
    if (process.env.NODE_ENV !== "production" || process.env.REACT_APP_REPORT_ERRORS === "false") return;
    serverRequest("error", {
        text: messageToServer,
        showLoader: false,
        handleErrors: false
    });
}
