import Polyglot from "node-polyglot";
import * as URLParamsHelper from "../Helpers/URLParams";
import { originalTranslations, otherTranslations } from "./translations";

let lang = URLParamsHelper.getVKLanguage().slice(0, 2);

let phrases = otherTranslations[lang] || originalTranslations;

let polyglot = new Polyglot({
    locale: lang,
    phrases
});

type GetArgsType<T> = T extends (...args: infer U) => any ? U : {};

type translateOptions = GetArgsType<typeof polyglot.t>;

type phrases = keyof typeof originalTranslations;

export function _t<T extends phrases>(phrase: T, options?: translateOptions[1]) {
    return polyglot.t(phrase, options);
}