import copy from "copy-to-clipboard";
import { f7 } from "framework7-react";
import { _t } from "../Localization";

export default (text: string) => {
    copy(text) &&
        f7.toast.create({
            text: _t("Copied"),
            closeTimeout: 1000
        }).open();
}