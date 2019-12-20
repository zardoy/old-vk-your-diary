import Framework7, { Framework7Plugin } from "framework7/components/app/app-class";

const PLUGIN_NAME = "overswipeFix";

export default {
    name: PLUGIN_NAME,
    create() {
        let app: Framework7 = this;
        let preventClicks = function(e){
            if(e.target.parentElement.classList.contains("swipeout-actions-opened"))return;
            e.stopPropagation();
            app.swipeout.close(app.swipeout.el);
            this.removeEventListener("click", preventClicks, true);
        };
        app.on("touchstart:active", () => {
            if(!app.swipeout.el)return;
            (app.swipeout.el as HTMLElement).closest("ul").addEventListener("click", preventClicks, true);
        });
    }
} as Framework7Plugin