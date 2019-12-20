export const originalTranslations = {
    "AppNameTitle": "Your Diary",
    "Back": "Back",
    "AttachmentsTitle": "attachments",
    "Diary": "Diary",
    "Settings": "Settings",
    "Yes": "yes",
    "No": "no",
    "ConfirmAction": "Confirm action",
    "SelectGroup": "Select group to join",
    "CancelButton": "Cancel",
    "ServerCantRigester": "Server is unable to register you",
    "ServerGeneralError": "Failed to %{methodError}",
    "UploadingFilesLabel": "Uploading files %{filesUploaded} / %{filesTotal}",
    "ServiceRenderCrashTitle": "Service catch an error!",
    "ReloadAppWithoutCache": "Reload app without cache",
    "ContactToDeveloper": "Contact to developer",
    "FailedToShareLink": "Failed to share link",
    "AddGroup": "Add group",
    "GroupTitle": "Group",
    "LeaveGroupConfirm": "Leave group",
    "TokenOfThisGroup": "Token of This Group",
    "CopyAction": "Copy",
    "DeleteTask": "Delete task",
    "Copied": "Copied",
    "ShareInvite": "Share invite",
    "ClosePopup": "Close",
    "Loading...": "Loading...",
    "GroupsWelcomeText": "Before using the diary, you need to add the group first",
    "ServerErrorsText": {
        "homework.GetAll": "fetch all homework",
        "homework.Get": "fetch topical homework",
        "homework.Search": "search the homework",
        "homework.Add": "add new homework",
        "homework.Delete": "delete the homework",
        "homework.Edit": "edit the homework",
        "group.Join": "join the group",
        "group.Leave": "leave the group",
        "group.Create": "create new group",
        "group.NewToken": "generate new token",
        "group.GetToken": "fetch the token",
        "group.GetQR": "fetch the QR",
        "group.GetInfo": "fetch group info",
        "group.SetName": "update group name",
        "group.SetDescription": "update group description",
        "user.GetGroups": "fetch the groups",
        "user.Register": "register you",
        "file.GetInfo": "fetch file info",
        "file.Upload": "upload the file",
        "error": "send the message"
    },
    "ServerResponseErrors": {
        "database connection is lost": "Database connection is lost. Try again it later",
        "invalid sign": "Invalid application sign. Make sure that this app launched via VK",
        "user not registered": "Server needs to register you first. Reload this app",
        "one of params is not specified": "API Error: wrong request params",
        "user not in the same group with task": "You are not in the same group with this task",
        "user is already in group": "You are already in this group!",
        "invalid token": "Group with this token doesn't exists",
        "user has already been in database": "You are already registered. Try to reload this app",
        "incorrect group": "This group doesn't exists! Try to reload this app",
        "too many groups per user": "Too many groups. Please delete some of them first",
        "file too large": "Uploading file is too large",
        "can`t upload a file": "Can`t upload a file. Try again later",
        "unknown method": "API Error: invoked unknown method",
        "method disabled": "Sorry, this function is temporary disabled",
        "wrong file id": "API Error: this file doesn't exists",
        "you are not files`s owner": "You do not have access to this files",
        "this file was attached to other hometask": "This file is already attached. Try to upload antoher one",
        "unsupported file extension": "We can't upload file with this extenstion, you can try to change it"
    }
}

type translationsType<T> = {
    [K in keyof T]: T[K] extends object ? translationsType<T[K]> : string
}

type OtherTranslationsType = {
    [lang: string]: translationsType<typeof originalTranslations>
}

export const otherTranslations: OtherTranslationsType = {
    "ru":{
        "FailedToShareLink": "Не удалось поделиться ссылкой",
        "Back": "Назад",
        "Copied": "Скопированно",
        "AttachmentsTitle": "Вложения",
        "AppNameTitle": "Твой Дневник",
        "Diary": "Дневник",
        "ShareInvite": "Поделится приглашением",
        "GroupTitle": "Группа",
        "Settings": "Настройки",
        "Yes": "Да",
        "No": "Нет",
        "SelectGroup": "Выберите группы",
        "ConfirmAction": "Подтвердите действие",
        "CancelButton": "Отмена",
        "Loading...": "Загрузка...",
        "ServerCantRigester": "Сервер не хочет регистрировать тебя!",
        "ServerGeneralError": "Не удалось %{methodError}",
        "UploadingFilesLabel": "Загрузка файлов %{currentFile} / %{filesTotal}",
        "ServiceRenderCrashTitle": "Произошла неполадка с сервисом :(",
        "ReloadAppWithoutCache": "Перезагрузить сервис, очистив кэш",
        "ContactToDeveloper": "Написать разработчику",
        "AddGroup": "Добавить группу",
        "LeaveGroupConfirm": "Покинуть группу",
        "TokenOfThisGroup": "Ключ этой группы",
        "DeleteTask": "Удалить задание",
        "ClosePopup": "Закрыть",
        "CopyAction": "Скопировать",
        "GroupsWelcomeText": "Для того, что бы начать пользоваться дневником, необходимо сначала вступить в группу",
        "ServerErrorsText": {
            "homework.GetAll": "получить все задания",
            "homework.Get": "получить актуальное ДЗ",
            "homework.Search": "провести поиск среди ДЗ",
            "homework.Add": "добавить задание",
            "homework.Delete": "удалить задание",
            "homework.Edit": "редактировать задание",
            "group.Join": "присоединиться к группе",
            "group.Leave": "покинуть группу",
            "group.Create": "создать новую группу",
            "group.NewToken": "сгенерировать новый токен",
            "group.GetToken": "получить токен",
            "group.GetQR": "получить QR",
            "group.GetInfo": "получить сведения о группе",
            "group.SetName": "поменять имя группы",
            "group.SetDescription": "поменять описание группы",
            "user.GetGroups": "получить список групп",
            "user.Register": "занести тебя в систему",
            "file.GetInfo": "получить сведения о файле",
            "file.Upload": "загрузить файл",
            "error": "отправить сообщение"
        },
        "ServerResponseErrors": {
            "database connection is lost": "Потерянно соединение с базой данных. Повторите попытку позже",
            "invalid sign": "Неправильная подпись. Убедитесь, что приложение запущенно через ВК",
            "user not registered": "Сначала вас необходимо занести в систему, для этого перезапустите приложение",
            "one of params is not specified": "Некорректные параметры запроса",
            "user not in the same group with task": "Вы не можете работать с заданием, пока оно находится в другой группе",
            "user is already in group": "Вы уже состоите в этой группе",
            "invalid token": "Группа с этим ключом не существует",
            "user has already been in database": "Вы уже занесены в систему, перезапустите приложение",
            "incorrect group": "Вы не можете работать с группой, которой не существует! Выберете другую",
            "too many groups per user": "Достигнут лимит на добавления новых групп",
            "file too large": "Uploading file is too large",
            "can`t upload a file": "Can`t upload a file. Try again later",
            "unknown method": "API Error: invoked unknown method",
            "method disabled": "Sorry, this function is temporary disabled",
            "wrong file id": "API Error: this file doesn't exists",
            "you are not files`s owner": "You do not have access to this files",
            "this file was attached to other hometask": "This file is already attached. Try to upload antoher one",
            "unsupported file extension": "We can't upload file with this extenstion, you can try to change it"
        }
    }
}