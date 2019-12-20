import { ServerRequestData } from "./serverAPI";
import { f7 } from "framework7-react";
import { GetServerRequestPostParams, requestParamsMaps, otherMethodsEnhancers, GetServerRequestResponseData } from "./methods";
import vkConnect from "@vkontakte/vk-connect";
import { _t } from "../Localization";

export const getBackendUrlBase = () => {
    return "https://api.somecrap.ru/hw/service_api/request.php?" + window.location.search.slice(1);
};

//APPEND K PARAM

type RequestResponseData<T extends keyof ServerRequestData> = Promise<GetServerRequestResponseData<T> & RequestErrorObject>;

export interface serverRequestGeneralParams {
    showLoader?: boolean,
    handleErrors?: boolean,
    fetchOptions?: FetchOptions,
    useGetMethod?: boolean
}
// export interface serverRequestGeneralParams {
//     showLoader?: boolean,
//     errors?: {
//         handleErrors?: "all" | "notServer" | "none", //default: all
//         showError?: boolean, //default: true
//         returnError?: boolean //default: false -- if false, then never be executed
//     },
//     fetchOptions?: FetchOptions
// }

interface RequestErrorObject {
    hasError?: true,
    err?: Error | ServerError
}

export type GetServerRequestParams<T extends keyof ServerRequestData> = ServerRequestData[T] extends {
    params: infer U
} ? U : GetServerRequestPostParams<T>;

type GetServerRequestParamsIntersection<T extends keyof ServerRequestData> = GetServerRequestParams<T> & serverRequestGeneralParams;

type FetchOptions = Partial<Parameters<typeof fetch>[1]>;

export default function serverRequest<T extends keyof ServerRequestData = keyof ServerRequestData>(methodName: T, params: GetServerRequestParamsIntersection<T>): RequestResponseData<T> {
    //@ts-ignore
    let { fetchOptions = {}, showLoader = true, handleErrors = true, useGetMethod = false, ...requestParams } = params;
    let postParams = (methodName in requestParamsMaps ? requestParamsMaps[methodName](requestParams as any) : requestParams);
    if (showLoader)
        f7.preloader.show();

    let formData: FormData = new FormData();
    let url = new URL(getBackendUrlBase());
    url.searchParams.append("method", methodName);

    let hasParams = Object.keys(postParams).length !== 0;
    if (hasParams) {
        Object.entries(postParams).forEach(([key, value]: [string, string]) => {
            if (value === null) return;
            formData.append(key, value);
        });
    }
    const makeRequest = async (_isSecondAttemp = false) => {
        try{
            let fetchResponse = await fetch(url.toString(), {
                    method: useGetMethod ? "GET" : hasParams ? "POST" : "GET",
                    body: hasParams ? formData : null,
                    //@ts-ignore
                    ...fetchOptions
                });
            
            if(showLoader) f7.preloader.hide();

            let jsonResponse = await fetchResponse.json();
            
            if(jsonResponse.error){
                throw new ServerError({
                    message: jsonResponse.error.message,
                    error_code: jsonResponse.error_code,
                    method_name: methodName
                });
            }
            // if (response.error) {
            //     if (response.error === "database connection is lost") {
            //         if (_isSecondAttemp) {
            //             reject(new ServerError("У нас небольшие технические шоколадки с базой данных. Мы уже в курсе и чиллим!"));
            //         } else {
            //             makeRequest(true);
            //         }
            return methodName in otherMethodsEnhancers ? otherMethodsEnhancers[methodName].parseReceivedData(jsonResponse) : jsonResponse;
        } catch (err) {
            if (err.name === "AbortError") return { hasError: true, err };
            if(methodName in otherMethodsEnhancers) return otherMethodsEnhancers[methodName].handleErrors(err);
            else if(handleErrors)return handleRequestError(err);
            throw err;
        }
    };
    return makeRequest();
}

export const handleRequestError = (err: ServerError): Required<RequestErrorObject> => {
    vkConnect.send("VKWebAppTapticNotificationOccurred", { "type": "error" });
    let title = _t("ServerGeneralError", { methodError: _t("ServerErrorsText." + err.method_name as any) });
    let message = _t("ServerResponseErrors." + err.message as any);
    f7.dialog.alert(message, title);
    return { hasError: true, err };
}

export class ServerError extends Error {
    error_code: number;
    method_name: keyof ServerRequestData;

    constructor({ message, error_code, method_name }: { message: string, error_code: number, method_name: keyof ServerRequestData}) {
        super(message);
        this.message = message;
        this.error_code = error_code;
        this.method_name = method_name;
    }
}