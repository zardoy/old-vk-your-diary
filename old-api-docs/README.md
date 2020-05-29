Table of Contents
=================

- [Table of Contents](#table-of-contents)
- [Дневник (Сервис Вконтакте)](#дневник-сервис-вконтакте)
- [API, использующее приложение](#api-использующее-приложение)
	- [homework.GetAll - получение прошлых ДЗ](#homeworkgetall---получение-прошлых-дз)
	- [homework.Get - получение актуальных ДЗ](#homeworkget---получение-актуальных-дз)
	- [homework.Search - поиск Заданий](#homeworksearch---поиск-заданий)
	- [homework.Add - добавление ДЗ](#homeworkadd---добавление-дз)
	- [homework.Delete - Удаление Задания](#homeworkdelete---удаление-задания)
	- [Homework.Edit - Редактирования Задания](#homeworkedit---редактирования-задания)
	- [group.Join - Присоединение к группе](#groupjoin---присоединение-к-группе)
	- [group.Leave - Выход из группы](#groupleave---выход-из-группы)
	- [group.Create - Создание группы](#groupcreate---создание-группы)
	- [group.NewToken - Создание нового токена для группы](#groupnewtoken---создание-нового-токена-для-группы)
	- [group.GetToken](#groupgettoken)
	- [group.GetQR - Получение изображения с QR кодом](#groupgetqr---получение-изображения-с-qr-кодом)
	- [group.GetInfo - Получение информации о группе по ID](#groupgetinfo---получение-информации-о-группе-по-id)
	- [group.GetInfoByToken - Получение информации о группе по ключу (токену)](#groupgetinfobytoken---получение-информации-о-группе-по-ключу-токену)
	- [group.SetName - Обновление названия группы](#groupsetname---обновление-названия-группы)
	- [group.SetDescription - Обновление описания группы](#groupsetdescription---обновление-описания-группы)
	- [auth.Check - Проверка авторизации](#authcheck---проверка-авторизации)
	- [user.Register - Регистрация пользователя](#userregister---регистрация-пользователя)
	- [user.GetGroups - Получение групп пользователя](#usergetgroups---получение-групп-пользователя)
	- [file.Upload - Загрузка файла на сервер](#fileupload---загрузка-файла-на-сервер)
	- [file.Get - Скачивание файла](#fileget---скачивание-файла)
	- [file.GetInfo - Получение сведений о файле](#filegetinfo---получение-сведений-о-файле)
	- [error - Логирование ошибки на сервере](#error---логирование-ошибки-на-сервере)
- [Ошибки в методах](#ошибки-в-методах)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

# Дневник (Сервис Вконтакте)
Электронный дневник, который заполняют ученики.

Далее:
Токен группы  - это ключ (специальный набор символов) предназначенный для предоставления возможности присоединяться другим пользователям к конкретнной группе.
Однако стоит помнить, что имея при себе токен группы не всегда будет возможность присоединиться к ней, так как любой из неё участников может сменить токен группы на новый.
# API, использующее приложение

 Все запросы делать по адресу `https://api.somecrap.ru/hw/service_api/request.php`.
**Обязательные** GET параметры в каждом из методов:

| name | default | description |
| ----- | ---- | ------ |
| method | **Required** | Имя метода |
| vk_params | **Required** | Все параметры, отдаваемые ВК |

- Любой метод **обязан** возвращать JSON

- Дополнительные параметры в методах посылаются через **POST** метод

### homework.GetAll - получение прошлых ДЗ
- Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы для поиска |
| offset | number | **Required** | Смещение по результатам |

* Если offset = 1, то будут показаны результаты с 1 по 50
* Если offset = 51, то будут показаны результаты с 51 по 100

- Возвращает массив всех ДЗ из базы

```
 {
	"task_id": number,
	"subject": string,
	"homework": string,
	"date": number,
	"files": number[]
 }[]
```

### homework.Get - получение актуальных ДЗ
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

 - Возвращает:  **Массив** дз
 ```
 {
	"task_id": number,
	"subject": string,
	"homework": string,
	"date": number,
	"files": number[]
 }[]
 ```
 -- date в **UNIX** формате
 
 ### homework.Search - поиск Заданий
- Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы для поиска |
| query | string | **Required** | Строка для поиска |
| offset | number | **Required** | Смещение по результатам поиска |

* Если offset = 1, то будут показаны результаты с 1 по 50
* Если offset = 51, то будут показаны результаты с 51 по 100

- Возвращает массив ДЗ, в которых найдена строка

```
 {
	"task_id": number,
	"subject": string,
	"homework": string,
	"date": number,
	"files": number[]
 }[]
```
 
 ### homework.Add - добавление ДЗ
 - Параметры:

| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| subject | string | **Required** | Название предмета |
| homework | string | **Required** | Текст с заданием |
| date | number | **Required** | Дата, на которое задано задание в **формате Unix** |
| group_id | number | **Required** | ID группы |
| files | string | Optional | ID файлов через запятую без пробелов

- Возвращает, если задание добавленно:

```
{
    "task_id": number
}
```
где task_id - **уникальный** идентификатор добавленного задания 

### homework.Delete - Удаление Задания
- Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
| task_id | number | **Required** | Идентификатор задания |
| group_id | number | **Required** | ID группы |

- Возвращает: ничего

### Homework.Edit - Редактирования Задания
- Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
| id | string &#124; number | **Required** | Идентификатор задания |
| subject | string | **Required** | Названия предмета |
| homework | string | **Required** | Текст задания |
| group_id | number | **Required** | ID группы |
| date | number | Optional | Дата, на которое задано задание в **формате Unix** |
| files | string | Optional | ID файлов через запятую без пробелов |

- Возвращает: ничего

### group.Join - Присоединение к группе
- Параметры:

name | type | default | description
| ----- | ---- | ------ | ---- |
token | string | **Required** | Токен группы

- Возвращает: 
	- Если токен не верный:
	
```
{
    "error": "invalid token"
}
```
- 
    - Если пользователь успешно присоединился к группе:

```
{
    "group_id": number
}
```
### group.Leave - Выход из группы

 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

- Возвращает: ничего
 
 ### group.Create - Создание группы
 - Параметры: нет
 - Возвращает, если группа создана и пользователь уже в ней:
 
 ```
{
    "group_id": number
}
```
По умолчанию название группы - ID группы, переведённое на латынь

### group.NewToken - Создание нового токена для группы
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

- Возвращает: ничего

### group.GetToken
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

 - Возвращает, если пользователь в группе и токен группы успешно получен:
 
 ```
 {
    "token": string
 }
 ```
 
 где token -- токен группы

### group.GetQR - Получение изображения с QR кодом
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

- Возвращает **изображение**  c QR кодом

### group.GetInfo - Получение информации о группе по ID
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |

- Возвращает:
```
{
    "name": string,
    "description": string
}
```

### group.GetInfoByToken - Получение информации о группе по ключу (токену)

| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| token | number | **Required** | Ключ группы |

- Возвращает:
```
{
    "name": string,
    "description": string
}
```

### group.SetName - Обновление названия группы
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |
| group_name | string | **Required** | Новое название группы |

- Возвращает:
```
{
    "response": "ok"
}
```

### group.SetDescription - Обновление описания группы
 - Параметры:
 
| name | type | default | description | 
| ----- | ---- | ------ | ---- |
| group_id | number | **Required** | ID группы |
| group_description | string | **Required** | Новое описание группы |

- Возвращает:
```
{
    "response": "ok"
}
```

### auth.Check - Проверка авторизации
- Параметры: нет
- Возвращает, если пользователь состоит в группе:

 ```
{
    "response": "ok"
}
```

### user.Register - Регистрация пользователя
- Описание: Необходимо вызывать **единожды** перед работой с любым другим методом для каждого пользователя, который впервые попадает в сервис.
Этот метод также можно вызывать просто в случае ошибки "user not registered" (подробнее ниже).
- Параметры: нет
- Возвращает:

```
{
    "response": "ok"
}
```

### user.GetGroups - Получение групп пользователя
- Параметры: нет
- Возвращает:
```
{
    "groups": {
        group_id: number,
        group_name: string,
        group_description: string
    }[],
    "limitReached": boolean
}
```

### file.Upload - Загрузка файла на сервер
- Описание: загружает файл на сервер. Файл будет принадлежать пользователю, от лица которого он был загружен.
-  Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
uploadfile | file | **Required** | Любой файл размером до 19Мб включительно (19922944 Байт)

- Возвращает: ID файла
```
{
    "file_id": number
}
```

Список поддерживаемых расширений файлов:
- png
- jpeg
- jpg
- pdf
- svg
- gif
- doc
- docx
- html
- css
- htm
- odt
- rtf
- txt
- wps
- xml
- xps
- csv
- dbf
- dif
- ods
- prn
- slk
- xls
- xlsx
- xlt
- xps
- bmp
- odp
- pot
- potx
- pps
- ppsx
- ppt
- pptx
- tif

### file.Get - Скачивание файла
- Описание: Скачивает файл с севрвера, если он прикреплён к заданию.
-  Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
file_id | number | **Required** | ID файла
group_id | number | **Required** | ID группы

- Возвращает: файл

### file.GetInfo - Получение сведений о файле
-  Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
file_id | number | **Required** | ID файла
group_id | number | **Required** | ID группы

- Возвращает:
```
{
    "file_name": string,
    "file_size": number,
    "file_id": number,
    "group_id": number
}
```

### error - Логирование ошибки на сервере
- Описание: это специальный метод, который не связан с работой конкретного пользователя и нацелен на анализ и устранение ошибок в сервисе
-  Параметры:

| name | type | default | description |
| ----- | ---- | ------ | ---- |
text | string | **Required** | Развернутый текст ошибки

- Возвращает: **неизвестно**

## Ошибки в методах
В случае, если в методе произошла ошибка, возвращается объект со свойствами error и error_code:
```
{
    "error_code": number,
    "error": {
        "message": string,
        "description": string
    }
}
```

* description - поле, содержащее техническую информацию

Возможные ошибки:

error.message | причина | рекомендуемые действия | error_code
| ----- | ---- | ------ | ---- |
database connection is lost | Потеря соединения с базой данных | Повторить запрос | 1
invalid sign | Неправильная подпись пользователя ВК | Убедится, что передаются правильные параметры от ВК | 2
user not registered | Пользователь не зарегистрирован для работы с ним | Вызвать метод **user.Register** | 3
one of params is not specified | Отсутствие одного или несколько дополнительных параметров | Убедится в правильности вызова метода | 4
user not in the same group with task | Указанн неверный индентификатор задания | Проверить источник данных для id в параметрах вызываемого метода | 5
user is already in group | Пользователь уже в группе с данным токеном | Сообщить об этом пользователю | 6
invalid token | Был передан неверный токен в **group.Join** | Сказать пользователю, что бы использовал уже верный | 7
user has already been in database | Был использован метод **user.Register** без какой-либо нужды на это | Не использовать этот метод просто так | 8
incorrect group | Неправльно передан параметр group_id | Проверить ID группы | 9
too many groups per user | Пользователь состоит уже в пяти группах | Выйти из ненужной | 10
file too large | Файл превышает допустимый размер | Отправить файл поменьше | 11
can\`t upload a file | Ошибка загрузки файла | Отправить другой файл/повторить попытку | 12
unknown method | API был вызван с несуществующим названием метода | Проверить не опечатались ли вы | 13
method disabled | Метод отключен по какой-либо причине | Повторить запрос позже | 14
wrong file id | Неверный ID файла | Проверить ID или загрузить файл заново | 15
you are not files\`s owner | Вы не являетесь владельцем файла | Прикрепить другой файл, загрузить другой | 16
this file was attached to other hometask | Файл уже прикреплён у другому заданию | Загрузить файл заново | 17
unsupported file extension | Файл с таким расширением нельзя загрузить | Загружать только разрешённые форматы | 18
too many files | Слишком много файлов. Максимум 10. | Загружать адекватное кол-во файлов | 19

- Пример:
```
{
    "error": "invalid token"
}
```
