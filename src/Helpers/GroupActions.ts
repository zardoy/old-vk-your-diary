import serverRequest from "../Backend";
import copyText from "./CopyText";
import { f7 } from "framework7-react";
import { _t } from "../Localization";
import { getGroupInviteLink, VKShareLink } from "./URLParams";

const groupActions = (group_id: number) => {
    return {
        async showGroupToken() {
            let { hasError, token } = await serverRequest("group.GetToken", { group_id });
            if (hasError) return;
            f7.simplePopups.confirm({
                title: _t("TokenOfThisGroup"),
                text: token,
                confirmButton: {
                    text: _t("CopyAction"),
                    onClick: () => copyText(token)
                },
                cssClass: "show_group_token_dialog"
            });
        },
        propmtGenerateNewToken() {
            let callback = async () => {
                let { hasError } = await serverRequest("group.NewToken", { group_id });
                if (hasError) return;
                f7.dialog.alert("Новый ключ группы создан!", "Успех!");
            }
            f7.simplePopups.confirm({
                title: _t("ConfirmAction"),
                text: "Будет создан новый ключ группы и старый станет более недействительным",
                verticalButtons: true,
                confirmButton: {
                    text: "Создать новый ключ",
                    level: "danger",
                    onClick: callback
                }
            });
        },
        async shareJoinLink() {
            let { hasError, token } = await serverRequest("group.GetToken", { group_id });
            if(hasError) return;
            let link = getGroupInviteLink(token);
            if(!link) return;
            VKShareLink(link, "Дневник. Вступить в группу");
        }
    }
}

export default groupActions;