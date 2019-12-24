import React, { useEffect, useState } from "react";
import { App, View, f7, f7ready, Views, Toolbar, Link } from "framework7-react";
import vkConnect from "@vkontakte/vk-connect";
import f7params from "./f7params";
import LoadingPage from "../Pages/LoadingPage";
import { SettingsProvider } from "../libs/f7-settings-provider";
import settingsScheme from "./settingsScheme";
import serverRequest, { logApplicationErrorToServer } from "../Backend";
import { useDispatch } from "react-redux";
import { setGroupsInfo, setCurrentGroupId } from "../Redux/groups/actions";
import { vkStorageGet, VKStorageKeys, vkStorageSet } from "../Helpers/VKStorage";
import { handleVkConnectError } from "../Helpers/VKConnectHelper";
import { _t } from "../Localization";
import { getVKParam, hasGroupInviteInUrl, getGroupTokenFromUrl } from "../Helpers/URLParams";
import routes from "./routes";

const mapVKPlatforms = {
    mobile_android: VKStorageKeys.APP_ANDROID_SETTINGS,
    mobile_iphone: VKStorageKeys.APP_IOS_SETTINGS,
    mobile_web: VKStorageKeys.APP_MOBILE_SETTINGS,
    desktop_web: VKStorageKeys.APP_DESKTOP_SETTINGS,
    mobile_android_messenger: VKStorageKeys.APP_ANDROID_SETTINGS,
    mobile_iphone_messenger: VKStorageKeys.APP_IOS_SETTINGS
}

const getSettingPlatform = (): VKStorageKeys => {
    return mapVKPlatforms[getVKParam("platform")] || null;
}

const settingsSaver = (generalSettings) => {
    //TODO: ОПТИМИЗАЦИЯ тк слишком дорогостоющие вычисления для функции вызывающийся каждый раз когда меняется настройка
    //TODO: rework flags (вынести общую логику)
    let platformSettings = {};
    Object.entries(settingsScheme).forEach(([, listData]) => {
        Object.entries(listData.items).forEach(([settingID, settingData]) => {
            if (!(settingID in generalSettings)) return;
            if (settingData.tags && settingData.tags.includes("diffPlatform")) {
                platformSettings[settingID] = generalSettings[settingID];
                delete generalSettings[settingID];
            }
        });
    });
    vkStorageSet(VKStorageKeys.APP_GENERAL_SETTINGS, generalSettings);
    vkStorageSet(getSettingPlatform(), platformSettings);
}

const showErrorToUser = (message: string) => {
    vkConnect.send("VKWebAppTapticNotificationOccurred", { "type": "error" });
    f7.dialog.create({
        title: "Не удалось загрузить приложение",
        text: message,
        buttons: [{
            text: "Перезагрузить приложение",
            onClick: () => window.location.reload(true)
        }]
    }).open();
}

const getAppUserSettings = async () => {
    const generalSettings = await vkStorageGet(VKStorageKeys.APP_GENERAL_SETTINGS);
    const platformSettings = await vkStorageGet(getSettingPlatform());

    return { ...(generalSettings || {}), ...(platformSettings || {}) };
}

const useInitUser = (): [boolean, {}] => {
    let dispatch = useDispatch();
    let [userSettings, setUserSettings] = useState({});
    let [loadingComplete, setLoadingComplete] = useState(false);
    useEffect(() => {
        const onLoadingComplete = () => {
            f7.views["settings"].router.navigate("/", {
                reloadAll: true
            });
        }
        const controller = new AbortController();
        const inner = async (_attemp_number = 1) => {
            let forTheFirstTime = false;
            try {// catch server error

                let { groups, limitReached } = await serverRequest("user.GetGroups", { showLoader: false, handleErrors: false, fetchOptions: { signal: controller.signal } });

                dispatch(setGroupsInfo(groups, limitReached));

                let groupsId = groups.map(groupInfo => groupInfo.group_id);

                try {// catch vk error
                    let currentGroupId = +await vkStorageGet(VKStorageKeys.CURRENT_GROUP_ID);

                    setUserSettings(await getAppUserSettings());

                    setLoadingComplete(true);
                    onLoadingComplete();

                    if (currentGroupId && groupsId.includes(currentGroupId)) {
                        dispatch(setCurrentGroupId(currentGroupId, false));
                        f7.views["diary"].router.navigate("/");
                    } else {
                        f7.views.current.router.navigate("/groupsSelect/", {
                            props: {
                                forTheFirstTime
                            },
                            clearPreviousHistory: true
                        });
                    }

                    checkHashGroupToken();
                } catch (err) {
                    handleVkConnectError("VK Storage Error", err, showErrorToUser);
                    console.error(err);
                }
            } catch (err) {
                if (err.error_code !== undefined && +err.error_code === 3) {
                    forTheFirstTime = true;
                    if (_attemp_number < 2) {
                        serverRequest("user.Register", { showLoader: false, handleErrors: false, fetchOptions: { signal: controller.signal } })
                            .catch(err => {
                                showErrorToUser(err.message);
                                return false;
                            })
                            .then((success = true) => {
                                if (success) inner(_attemp_number + 1);
                            })
                    } else {
                        showErrorToUser(_t("ServerCantRigester"));
                        return;
                    }
                } else {
                    showErrorToUser(err.message);
                    console.error(err);
                }
            }
        }
        f7ready(() => inner());
        return () => {
            controller.abort();
        }
    }, []);
    return [loadingComplete, userSettings];
}

const updateAppTheme = (themeScheme) => {
    let isDarkTheme = themeScheme === "client_dark" || themeScheme === "space_gray";
    let html = document.documentElement;
    let THEME_DARK = "theme-dark";
    if (isDarkTheme) html.classList.add(THEME_DARK)
    else html.classList.remove(THEME_DARK);
}

const checkHashGroupToken = () => {
    if (hasGroupInviteInUrl()) f7.views.current.router.navigate("/joinGroupByHash/", {
        props: {
            token: getGroupTokenFromUrl()
        }
    });
}

const useAppInit = () => useEffect(() => {
    const vkConnectListener = (e: any) => {
        switch (e.detail.type) {
            case "VKWebAppUpdateConfig":
                updateAppTheme(e.detail.data.scheme);
                break;
            default:
        }
    };
    vkConnect.subscribe(vkConnectListener);
    vkConnect.send('VKWebAppInit', {});

    const appErrorListener = (err) => {
        f7.dialog.alert(err.reason, "Ошибка веб-приложения");
        logApplicationErrorToServer(err, "unhandledrejection");
    }
    window.addEventListener("unhandledrejection", appErrorListener);

    window.addEventListener("hashchange", checkHashGroupToken);
    return () => {
        vkConnect.unsubscribe(vkConnectListener);
        window.removeEventListener("unhandledrejection", appErrorListener);
        window.removeEventListener("hashchange", checkHashGroupToken);
    }
}, []);

let AppComponent: React.FC = () => {
    useAppInit();

    let [, userSettings] = useInitUser();

    return <SettingsProvider settingsScheme={settingsScheme} userSettings={userSettings} onSaveSettings={settingsSaver}>
        <App params={f7params}>
            {
                <Views tabs>
                    <Toolbar bottom tabbar labels>
                        <Link tabLink="#diary-tab" tabLinkActive iconMaterial="subject" text={_t("Diary")} />
                        <Link tabLink="#settings-tab" iconF7="gear_alt" iconMd="material:settings_applications" text={_t("Settings")} />
                    </Toolbar>
                    <View tab id="diary-tab" tabActive routesAdd={routes.diaryView} name="diary">
                        <LoadingPage />
                    </View>
                    <View tab id="settings-tab" routesAdd={routes.settingsView} name="settings" loadInitialPage={false} />
                </Views>
            }
        </App>
    </SettingsProvider>
}

AppComponent = React.memo(AppComponent);

AppComponent.displayName = "App";

export default AppComponent;