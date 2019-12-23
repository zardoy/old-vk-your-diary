import { Framework7Plugin } from "framework7/components/app/app-class";
import Framework7 from "framework7";

declare module "framework7/components/app/app-class" {
    interface Framework7Class<Events> extends Plugin { }
}

type ParamsFromToastToCopy = "position" | "closeTimeout" | "text" | "destroyOnClose";

type ParamsFromToast = Pick<Parameters<Framework7["toast"]["create"]>[0], ParamsFromToastToCopy>;

interface Plugin {
    moreToasts: {
        showInfo(params: { type: "success" | "error" } & ParamsFromToast): ReturnType<Framework7["toast"]["create"]>
    }
}

function safe_html_tags_replace(str: string) {
    return str.replace(/[&<>]/g, tag => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        }[tag] || tag
    ));
}

export default {
    name: "moreToasts",
    create() {
        let app: Framework7 = this;
        app.moreToasts = {
            showInfo(params) {
                let toast = app.toast.create({
                    closeTimeout: params.closeTimeout || 1500,
                    text: `
                    <i class="color-green material-icons icon margin-right vertical-align-middle">${
                        params.type === "error" ? "error" :
                            params.type === "success" ? "" : null
                        }</i>
                    <span>${safe_html_tags_replace(params.text)}</span>
                    `,
                    destroyOnClose: true
                });

                return toast;
            }
        }
    }
} as any as Framework7Plugin