import { Framework7Params } from "framework7/components/app/app-class";
import { _t } from "../Localization";
import routes from "./routes";
import { vkIsDesktopVersion, getVKLanguage } from "../Helpers/URLParams";

export default {
    id: "com.zardoy.vk-diary",
    version: process.env.REACT_APP_VERSION,
    name: document.title,
    theme: vkIsDesktopVersion ? "aurora" : "auto",
    language: getVKLanguage(),
    routes: routes.general,
    panel: {
        closeByBackdropClick: false,
    },

    popup: {
        closeByBackdropClick: false,
    },
    dialog: {
        buttonCancel: _t("CancelButton"),
        preloaderTitle: _t("Loading...")
    },
    view: {
        removeElements: false
    },
    swipeout: {
        removeElements: false
    }
} as Framework7Params