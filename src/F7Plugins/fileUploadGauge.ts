import Framework7 from "framework7";
import { Framework7Plugin, Framework7Class } from "framework7/components/app/app-class";
import { Gauge } from "framework7/components/gauge/gauge";

declare module "framework7/components/app/app-class" {
    interface Framework7Class<Events> extends PluginScheme { }
    interface Framework7Params extends PluginParams { }
}

type paramsKeys = Exclude<keyof Gauge.Parameters, "el">;

type GaugeParams = {
    [paramKey in paramsKeys]?: Gauge.Parameters[paramKey]
}

interface PluginParams {
    fileUploadGauge: {
        initGaugeParams: GaugeParams
    }
}

type DialogInstance = ReturnType<Framework7["dialog"]["create"]>;
type GaugeInstance = ReturnType<Framework7["gauge"]["create"]>;

interface PluginScheme {
    fileUploadGauge: {
        show(params: { labelText: string, bottomText?: string }): ReturnType<Framework7["dialog"]["create"]>,
        close(animate?): void,
        update(params: GaugeParams): ReturnType<Framework7["gauge"]["update"]>,
        handleProgressEvent(event: ProgressEvent): void,
        readonly dialog: DialogInstance,
        readonly gauge: GaugeInstance,
    }

}

let extendApp = (app: Framework7) => {

    const errPluginTitle = "F7 Plugin fileUploadGauge";

    let dialog: DialogInstance = null;
    let gauge: GaugeInstance = null;

    app.fileUploadGauge = {
        show({ labelText, bottomText }) {//double click to cancel
            if (dialog) throw new Error(`${errPluginTitle}: Only one opened dialog with gauge allowed!`);
            dialog = app.dialog.create({
                el: document.createElement("div"),
                closeByBackdropClick: false
            });

            dialog.el.classList.add("dialog");
            dialog.el.style.background = "initial";

            gauge = app.gauge.create({
                el: dialog.el.appendChild(document.createElement("div")),
                value: 0,
                size: 250,
                borderColor: '#2196f3',
                borderWidth: String(15),
                bgColor: 'rgba(0, 0, 0, 0.1)',
                valueText: "0%",
                valueFontSize: String(41),
                valueTextColor: "white",
                labelText: labelText,
                labelTextColor: "white",
                ...app.params.fileUploadGauge.initGaugeParams
            });
            gauge.el.classList.add("gauge");

            dialog.open();

            return dialog;
        },
        close(animate = true) {
            dialog.on("closed", () => {
                gauge.destroy();
                dialog.el.remove();
                dialog.destroy();

                dialog = null;
                gauge = null;
            });
            dialog.close(animate);
        },
        update(params) {
            if (!gauge) throw Error(`${errPluginTitle}: You need to call show() the gauge before using update()!`);
            return gauge.update(params as any);
        },
        handleProgressEvent(event: ProgressEvent) {
            var perc = event.loaded / event.total;
            if (!isFinite(perc)) perc = 0;
            app.fileUploadGauge.update({
                value: perc,
                valueText: Math.floor(perc * 100) + "%"
            });
        },
        get gauge() {
            return gauge;
        },
        get dialog() {
            return dialog;
        }
    }
}

export default {
    name: "fileUploadGauge",
    params: {
        fileUploadGauge: {
            initGaugeParams: {}
        }
    } as any,
    create: extendApp
} as any as Framework7Plugin