import { Framework7Params } from "framework7/components/app/app-class";
import { _t } from "../Localization";
import routes from "./routes";
import { vkIsDesktopVersion, getVKLanguage } from "../Helpers/URLParams";
import vkConnect from "@vkontakte/vk-connect";

export default {
    id: "com.zardoy.vk-diary",
    version: process.env.REACT_APP_VERSION,
    name: document.title,
    theme: vkIsDesktopVersion() ? "aurora" : "auto",
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
    },
    on: {
        ptrPullEnd(_e, _d) {
            vkConnect.send("VKWebAppTapticImpactOccurred", { style: "light" })
        }
    }
} as Framework7Params