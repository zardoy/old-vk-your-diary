import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Page, Navbar, Block, BlockTitle, List, ListItem, Icon, f7 } from "framework7-react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../Redux/types";
import { HomeworkData } from "../../Redux/homework/types";
import serverRequest from "../../Backend";
import { removeHomeworkTask } from "../../Redux/homework/actions";
import copyText from "../../Helpers/CopyText";
import { _t } from "../../Localization";
import { downloadFileFromGroup, fetchFilesInfo, GroupFileInfo } from "../../Backend/File";

interface Props {
    taskId: number
}

const SkeletonFiles: React.FC<{ filesId: number[] }> = ({ filesId }) => {
    return <List>
        {filesId.map(fileId => (
            <ListItem key={fileId} className="skeleton-text skeleton-effect-blink" title={"________ " + fileId}>
                <Icon f7="doc" slot="media" />
            </ListItem>
        ))}
    </List>
}

let HomeworkPage: React.FC<Props> = (props) => {
    let selectedHomeworkType = useSelector((state: AppState) => state.homework.selectedHomeworkType);
    let cachedHomework = useSelector((state: AppState) => state.homework.cached[state.homework.selectedHomeworkType]);
    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId);

    let dispatch = useDispatch();

    let [filesInfo, setFilesInfo] = useState({} as {
        [fileId: number]: GroupFileInfo
    });

    let taskInfo = useMemo((): HomeworkData => {
        for (let [, tasks] of Object.entries(cachedHomework)) {
            for (let task of tasks) {
                if (props.taskId !== task.task_id) continue;
                return task;
            }
        }
        return null;
    }, []);

    let copyHomeworkText = useCallback(() => copyText(taskInfo.homework), [taskInfo])

    let reportHomework = useCallback(() => {
        let callback = async () => {
            let taskStr = JSON.stringify(taskInfo, null, 4);
            let { hasError } = await serverRequest("error", {
                text: "Task report:\n" + taskStr
            });
            if (hasError) return;
            f7.toast.show({
                text: "Жалоба отправлена!",
                icon: `<i class="icon material-icons color-green">done</i>`,
                position: "center",
                closeTimeout: 1500
            });
        }
        f7.simplePopups.confirm({
            title: _t("ConfirmAction"),
            text: "Подать жалобу нам на это задание? Не делайте это просто так!",
            confirmButton: {
                text: "Пожаловаться",
                level: "danger",
                onClick: callback
            }
        });
    }, [taskInfo]);

    let openHomeworkEditor = useCallback(() => {
        f7.views.current.router.navigate("/homeworkEditor/", {
            props: {
                taskId: props.taskId
            }
        });
    }, [props.taskId]);

    let removeHomework = useCallback(() => {
        let callback = async () => {
            let { hasError } = await serverRequest("homework.Delete", {
                group_id: currentGroupId,
                task_id: taskInfo.task_id
            });
            if (hasError) return;
            dispatch(removeHomeworkTask(taskInfo.task_id));
            f7.views.current.router.back();//todo: более плавный переход
        };
        f7.simplePopups.confirm({
            title: _t("ConfirmAction"),
            text: "Вы уверены, что хотите удалить это задание? Это действие нельзя отменить!",
            verticalButtons: true,
            confirmButton: {
                text: _t("DeleteTask"),
                level: "danger",
                onClick: callback
            }
        });
    }, [taskInfo, currentGroupId, dispatch]);

    let fetchFilesList = (doneFunc?: () => void) => {
        let controller = new AbortController();

        (async () => {
            let filesList = await fetchFilesInfo(taskInfo.files, currentGroupId, {
                fetchOptions: {
                    signal: controller.signal
                }
            });
            let filesInfo = {};
            for (let fileInfo of filesList) {
                filesInfo[fileInfo.fileId] = fileInfo;
            }

            doneFunc && doneFunc();

            setFilesInfo(filesInfo);
        })();
        return () => {
            controller.abort();
        }
    }

    useEffect(() => {
        return fetchFilesList();
    }, []);

    let isInArchive = selectedHomeworkType === "archive";

    if (!taskInfo) {
        f7.views.current.router.back();
        return <Page />;
    }

    //Todo: add ptr to page if there are any files in the task
    //todo: auto link detection: e.g. google.com
    return <Page
    // ptr={taskInfo.files.length !== 0 && }
    >
        <Navbar title="Просмтор задания" backLink={_t("Back")} />
        <BlockTitle large className="user-select-text">{taskInfo.subject}</BlockTitle>
        <Block strong style={{ whiteSpace: "pre-line" }} className="user-select-text">
            {taskInfo.homework}
        </Block>
        {taskInfo.files.length === 0 ? null :
            <>
                <BlockTitle>Прикрепленные файлы</BlockTitle>
                <List>
                    {
                        taskInfo.files.map(fileId => {
                            if (fileId in filesInfo) {
                                let fileInfo = filesInfo[fileId];
                                return <ListItem
                                    key={fileId}
                                    onClick={() => downloadFileFromGroup(fileInfo.fileId, currentGroupId, fileInfo.fileName)}
                                    title={fileInfo.fileName}
                                    link="#"
                                    after={f7.finder7.getReadableFileSize(fileInfo.fileSize)}
                                >
                                    <Icon slot="media" f7="doc" />
                                </ListItem>
                            } else {
                                return <ListItem key={fileId} className="skeleton-text skeleton-effect-blink" title={"____ " + fileId}>
                                    <Icon f7="doc" slot="media" />
                                </ListItem>
                            }
                        })
                    }
                </List>
            </>
        }
        <List>
            {/* <ListItem link="#" onClick={} disabled color="link">
                    <Icon slot="media" f7="doc_on_clipboard" />
                    Скопировать задание в другую группу
                </ListItem>
                <ListItem link="#" onClick={} disabled color="link">
                    <Icon slot="media" f7="doc_on_clipboard" />
                    Переместить задание в другую группу
                </ListItem> */}
            <ListItem link="#" onClick={copyHomeworkText} color="link">
                <Icon slot="media" f7="doc_on_clipboard" />
                Скопировать текст задания
                </ListItem>
            <ListItem link="#" onClick={openHomeworkEditor} color="link" disabled={isInArchive}>
                <Icon slot="media" material="edit" />
                Редактировать задание
                </ListItem>
            <ListItem link="#" onClick={reportHomework} color="link">
                {/* <Icon slot="media" f7="exclamationmark_octagon_fill" md="material:report" /> */}
                <Icon slot="media" material="report" />
                Пожаловаться на задание
                </ListItem>
            <ListItem link="#" onClick={removeHomework} color="red" className="color-link" rippleColor="red" disabled={isInArchive}>
                <Icon slot="media" material="delete" />
                Удалить задание
                </ListItem>
        </List>
    </Page>
}

HomeworkPage = React.memo(HomeworkPage);

HomeworkPage.displayName = "HomeworkPage";

export default HomeworkPage;