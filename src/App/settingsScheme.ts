import { SettingsScheme } from "../libs/f7-settings-provider/types";

// Do not change the default setting values. Ever

export default {
    "diarySettings": {
        title: "Настройки отображения",
        items: {
            "useHorizontalSwiper": {
                type: "switch",
                text: "Слайдер для ДЗ",
                tags: ["diffPlatform"],
                defaultActive: false
            },
            "rememberCompleteTasks": {
                type: "switch",
                text: "Запоминать выполнение заданий",
                defaultActive: false
            }
        }
    }
} as SettingsScheme