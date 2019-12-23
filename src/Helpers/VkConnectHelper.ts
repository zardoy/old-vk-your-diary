import vkConnect from "@vkontakte/vk-connect";
import { f7 } from "framework7-react";

export function handleVkConnectError(errorTitle: string, err, onErrorCausedNotByVK?: (message: string) => any) {
    let message = err.message || "Неизвестная ошибка";
    let vkError = true;
    switch (err.error_type) {
        case "client_error":
            if (err.error_data.error_code === 4 || err.error_data.error_reason === "Operation denied by user") return;
            message = "Client: " + (err.error_data.error_description || err.error_data.error_reason || "Неизвестная ошибка на стороне клиента");
            break;
        case "api_error":
            message = "Api: " + (err.error_data.error_msg || "Серверная ошибка");
            break;
        case "auth_error":
            message = "Auth: " + (err.error_data.error_description || err.error_data.error_reason || "Ошибка авторизации");
            break;
        default:
            vkError = false;
    }
    vkConnect.send("VKWebAppTapticNotificationOccurred", { "type": "error" });
    if (!vkError && onErrorCausedNotByVK) {
        onErrorCausedNotByVK(message);
    } else {
        f7.dialog.alert(message, errorTitle);
    }
}