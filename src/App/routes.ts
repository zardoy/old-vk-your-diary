import { Framework7Params } from "framework7/components/app/app-class";

import GroupsSelectTokenPage from "../Popups/GroupsSelect/TokenForm";
import GroupsSelectMainPage from "../Popups/GroupsSelect/Groups";
import GroupsSelectPopup from "../Popups/GroupsSelect";
import HomeworkEditor from "../Popups/HomeworkEditor";
import HomeworkTask from "../Pages/Diary/HWTask";
import HomeworkAttachments from "../Pages/Diary/HWAttachments";
import SettingsMain from "../Pages/Settings/SettingsMain";
import HomeworkMain from "../Pages/Diary/HWMain";
import JoinGroupPopup from "../Popups/JoinGroup";

const defaultRoute = {
    path: "(.*)",
    async(routeTo) {
        throw new TypeError("Incorrect route path: " + routeTo.path);
    }
};

interface appRoutes {
    [routesName: string]: Framework7Params["routes"]
}

let routes: appRoutes = {
    general: [
        {
            path: "/groupsSelect/",
            popup: {
                component: GroupsSelectPopup
            },
            // options: {
            //     transition: "f7-dive"
            // }
        },
        {
            path: "/joinGroupByHash/",
            popup: {
                component: JoinGroupPopup
            }
        },
    ],
    diaryView: [
        {
            path: "/diary/",
            component: HomeworkMain,
            options: {
                transition: "f7-dive"
            }
        },
        {
            path: "/homeworkTask/",
            component: HomeworkTask,
            options: {
                transition: "f7-parallax"
            }
        },
        {
            path: "/homeworkAttachments/",
            component: HomeworkAttachments,
            options: {
                transition: "f7-dive"
            }
        },
        {
            path: "/homeworkEditor/",
            popup: {
                component: HomeworkEditor
            }
        },
    ],
    settingsView: [
        {
            path: "/settings/",
            component: SettingsMain
        }
    ],
    groupsSelect: [
        {
            path: "/",
            component: GroupsSelectMainPage
        },
        {
            path: "/enterToken/",
            component: GroupsSelectTokenPage
        }
    ],
};

routes = Object.fromEntries(
    Object.entries(routes).map(([routesName, routes]) => [routesName, [...routes, defaultRoute]])
);

export default routes;