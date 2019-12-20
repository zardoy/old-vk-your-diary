//joinGropToken Checker Util
import vkConnect from "@vkontakte/vk-connect";
import { handleVkConnectError } from "./VKConnectHelper";
import { _t } from "../Localization";

const URL_INVITE_PARAM = "joingrouptoken";

export function removeInviteParam() {
    vkConnect.send("VKWebAppSetLocation", { location: "" });
    window.location.hash = "";
}

export function isValidGroupToken(md5: string) {
    return (/^[a-f0-9]{32}$/).test(md5);
}

export function getTokenFromQRCode(decodedString) {
    if (isValidGroupToken(decodedString))return decodedString;
    try{//Check if URL
        let url = new URL(decodedString);
        if (!hasGroupInviteInUrl(url)) throw new Error("Это не ключ группы :/");
        return getGroupTokenFromUrl(url);
    }catch(e){
        if (e.message.includes("Invalid URL")){
            throw new Error("Вы отсканировали не приглашение в группу");
        }else{
            throw e;
        }
    }
}

export function hasGroupInviteInUrl(url: {hash: string} = window.location) {
    let hash = url.hash.slice(1).toLowerCase();
    return hash.startsWith(URL_INVITE_PARAM) ? isValidGroupToken(hash.slice(URL_INVITE_PARAM.length)) : false;
}

export function getGroupTokenFromUrl(url: {hash: string} = window.location) {
    return url.hash.slice(URL_INVITE_PARAM.length+1);
}

export function getVKLanguage() {
    return getVKParam("language") || window.navigator.language || "en";
}

export function vkIsDesktopVersion() {
    return getVKParam("platform") === "desktop_web";
}

type knownVKParams = "user_id" | "app_id" | "is_app_user" | "are_notifications_enabled" | "language" | 
    "ref" | "access_token_settings" | "group_id" | "viewer_group_role" | "platform" | "is_favorite";


export function getVKParam(param: knownVKParams) {
    let vk_param = "vk_"+param;
    return new URL(window.location.toString()).searchParams.get(vk_param);
}

export function VKShareLink(link: string, desktopMessageTitle: string) {
    if(vkIsDesktopVersion()){
        let win = window.open("https://vk.com/share.php?url=" + link + "&title=" + encodeURIComponent(desktopMessageTitle), "", "width=500, height=300");
        const closeWin = () => {
            win.close();
            removeListener();
        }
        const removeListener = () => {
            window.removeEventListener("focus", closeWin);
        }
        window.addEventListener("focus", closeWin);
        win.onclose = removeListener;
    }else{
        vkConnect.sendPromise("VKWebAppShare", { link })
            .catch(handleVkConnectError.bind(this, _t("FailedToShareLink")));
    }
}

export function getGroupInviteLink(token){
    let app_id = getVKParam("app_id");
    if(!app_id)return null;
    return `https://vk.com/app${app_id}#${URL_INVITE_PARAM}${token}`;
}