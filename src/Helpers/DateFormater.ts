export default (language, dates) => {//This function was created to format date for Framework7's Datepicker Component
    let userDate = dates[0];
    let today = new Date();
    let postfix = getDayName(userDate, language);
    today.setDate(today.getDate() + 1);//tomorrow
    if(datesAreEqual(today, userDate)){
        postfix = "Завтра";
    }
    today.setDate(today.getDate() + 1);//a day after tomorrow
    if(datesAreEqual(today, userDate)){
        postfix = "Послезавтра";
    }
    postfix = postfix.charAt(0).toUpperCase() + postfix.slice(1);
    return Intl.DateTimeFormat(language).format(userDate) + (postfix ? ` (${postfix})` : "");
}

export function getISODateDay(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getDayName(date, language) {
    let now = new Date();
    for(;now.getDay()<6;now.setDate(now.getDate() + 1)){
        if(datesAreEqual(now, date))return Intl.DateTimeFormat(language, {weekday: "long"}).format(now);
    }
    //TODO: реально нужна доработка
    // for(;now.getDay()<6;now.setDate(now.getDate() + 1)){
    //     if(datesAreEqual(now, date))return "Сл. " + Intl.DateTimeFormat(language, {weekday: "long"}).format(now);
    // }
    return "";
}

function datesAreEqual(date1, date2) {
    return Intl.DateTimeFormat().format(date1) === Intl.DateTimeFormat().format(date2);
}