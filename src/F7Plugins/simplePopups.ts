import { Framework7Plugin } from "framework7/components/app/app-class";
import Framework7 from "framework7";

declare module "framework7/components/app/app-class" {
    interface Framework7Class<Events> extends Plugin { }
}

type ParamsFromDialogToCopy = "cssClass" | "on" | "onClick" | "title" | "text" | "verticalButtons";
type ParamsFromDialog = Pick<Parameters<Framework7["dialog"]["create"]>[0], ParamsFromDialogToCopy>;

interface Plugin {
    simplePopups: {
        confirm(params: {
            confirmButton: {
                text: string,
                onClick: (...args) => any,
                /** "normal" by defaul */
                level?: "normal" | "danger",
                cssClass?: string
            },
            cancelButtonClick?: (...args) => any
        } & ParamsFromDialog): ReturnType<Framework7["dialog"]["create"]>
    }
}

export function safe_html_tags_replace(str: string) {
    return str.replace(/[&<>]/g, tag => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        }[tag] || tag
    ));
}

export default {
    name: "simplePopups",
    create() {
        let app: Framework7 = this;
        app.simplePopups = {
            confirm(params) {
                let { confirmButton, cancelButtonClick } = params;
                let { title, text, verticalButtons, on, cssClass, onClick } = params;
                text = safe_html_tags_replace(text); //text could be html
                let cancelButtonParams = {
                    text: app.params.dialog.buttonCancel,
                    bold: app.device.ios,
                    keyCodes: [27],
                    onClick: cancelButtonClick
                };
                let confirmButtonParams = {
                    text: confirmButton.text,
                    onClick: confirmButton.onClick,
                    color: confirmButton.level === "danger" ? "red" : null,
                    cssClass: confirmButton.cssClass,
                    keyCodes: [13]
                };
                let dialog = app.dialog.create({
                    title,
                    text,
                    verticalButtons,
                    on,
                    cssClass,
                    onClick,
                    destroyOnClose: true,
                    closeByBackdropClick: false,
                    buttons: verticalButtons ? [confirmButtonParams, cancelButtonParams] : [cancelButtonParams, confirmButtonParams]
                });
                dialog.open();
                return dialog;
            }
        }
    }
} as any as Framework7Plugin