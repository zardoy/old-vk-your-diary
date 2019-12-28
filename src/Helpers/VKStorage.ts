import vkConnect from "@vkontakte/vk-connect";
import { getVKParam } from "./URLParams";

export enum VKStorageKeys {
    CURRENT_GROUP_ID = "CURRENT_GROUP_ID",
    APP_GENERAL_SETTINGS = "APP_GENERAL_SETTINGS",
    APP_IOS_SETTINGS = "APP_IOS_SETTINGS",
    APP_ANDROID_SETTINGS = "APP_ANDROID_SETTINGS",
    APP_MOBILE_SETTINGS = "APP_MOBILE_SETTINGS",
    APP_DESKTOP_SETTINGS = "APP_DESKTOP_SETTINGS"
}

type IKeys = {
    key: string,
    value: any
}[]

let replaceSymbol = "➨";

const getParsedData = (key: VKStorageKeys, value: string) => {
    try {
        return JSON.parse(
            value.replace(new RegExp(replaceSymbol, "g"), `"`)
        );
    } catch (err) {
        if (err instanceof SyntaxError) {
            vkStorageSet(key, null);
        }
        return null;
    }
}

export async function vkStorageGet<T extends VKStorageKeys | VKStorageKeys[]>(key: T): Promise<T extends Array<any> ? IKeys : any | null> {
    if (process.env.NODE_ENV === "production") console.log("%cVK STORAGE KEY REQUESTED:", "color: deepskyblue", key);
    if (!getVKParam("app_id")) return null;
    let { keys } = await vkConnect.sendPromise("VKWebAppStorageGet", { keys: [].concat(key) });
    keys = keys.map(data =>
        ({
            ...data, value: data.value === "" ? null :
                getParsedData(data.key as VKStorageKeys, data.value)
        })
    );
    if (typeof key === "string") {
        return keys[0].value as any;
    } else {
        return { keys } as any;
    }
}

export async function vkStorageSet(key: VKStorageKeys, originalValue: any): Promise<boolean> {
    if (key === null || !getVKParam("app_id")) return false;
    let value: string;
    if (originalValue === null) {
        value = "";
    } else {
        value = JSON.stringify(originalValue);
        value = value.replace(new RegExp(replaceSymbol, "g"), "");
        value = value.replace(/\"/ig, replaceSymbol);
    }
    await vkConnect.sendPromise("VKWebAppStorageSet", { key, value });
    return true;
}
