import React, { useState, useEffect } from "react";
import { Page, List, ListItem, Icon, Navbar, f7, Block as BlockTitle } from "framework7-react";
import { useSelector } from "react-redux";
import { _t } from "../../Localization";
import { AppState } from "../../Redux/types";
import { downloadFileFromGroup, getFileInfoById } from "../../Backend/File";
import { useF7Ptr } from "../../Hooks/F7";

interface FileInfo {
    fileName: string,
    fileSize: number,
    fileId: number,
    taskId: number,
    taskDate: Date,
}

const FilesList: React.FC<{ files: FileInfo[], group_id: number }> = ({ files, group_id }) => {
    return <List>
        {
            files.map(fileInfo => (
                <ListItem
                    key={fileInfo.fileId}
                    header={fileInfo.taskDate.toLocaleDateString(f7.language)}
                    title={fileInfo.fileName}
                    after={f7.finder7.getReadableFileSize(fileInfo.fileSize)}
                    onClick={() => downloadFileFromGroup(fileInfo.fileId, group_id, fileInfo.fileName)}
                    link
                >
                    <Icon slot="media" f7="doc" />
                </ListItem>
            ))
        }
    </List>
}

const SkeletonFilesList: React.FC = () => {
    return <List className="skeleton-text skeleton-effect-blink">
        <ListItem header="15.09.2007" title="___________.doc">
            <Icon slot="media" f7="doc" />
        </ListItem>
        <ListItem header="15.23.2007" title="___________________.doc">
            <Icon slot="media" f7="doc" />
        </ListItem>
        <ListItem header="15.12.2007" title="_____________">
            <Icon slot="media" f7="doc" />
        </ListItem>
    </List>;
}

let HomeworkAttachments: React.FC = () => {
    let [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    let [filesList, setFilesList] = useState([] as FileInfo[]);

    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId);
    let selectedHomeworkType = useSelector((state: AppState) => state.homework.selectedHomeworkType);
    let cachedHomework = useSelector((state: AppState) => state.homework.cached[state.homework.selectedHomeworkType])

    const refreshFilesList = (doneFunc?: () => void) => {
        let controller = new AbortController();
        if (!doneFunc) {
            setShowLoadingSkeleton(true);
        }

        (async () => {
            let allFilesInfo = await Object.entries(cachedHomework)
                .reduce(async (prevPromise, [day, tasks]) => {//day: [tasks]
                    let prevTasksFilesInfo = await prevPromise;
                    let newTasksFilesInfo = await tasks.reduce(async (prevPromise, taskInfo) => {//task: [tasks]
                            let prevTasksFilesInfo = await prevPromise;
                            if(taskInfo.files.length === 0)return prevTasksFilesInfo;
                            let newTasksFilesInfo = await taskInfo.files.reduce(async (prevPromise, fileId) => {//task: [files]
                                let filesInfo = await prevPromise;
                                let fileInfo = await getFileInfoById(fileId, currentGroupId, {
                                    fetchOptions: {
                                        signal: controller.signal
                                    }
                                });
                                return filesInfo.concat({
                                    fileId: fileInfo.fileId,
                                    fileName: fileInfo.fileName,
                                    fileSize: fileInfo.fileSize,
                                    taskDate: new Date(day),
                                    taskId: taskInfo.task_id
                                });
                            }, Promise.resolve([] as FileInfo[]));
                            return prevTasksFilesInfo.concat(newTasksFilesInfo);
                        }, Promise.resolve([] as FileInfo[]));
                    return prevTasksFilesInfo.concat(newTasksFilesInfo);
                }, Promise.resolve([] as FileInfo[]));
            
            setShowLoadingSkeleton(false);
            setFilesList(allFilesInfo);
            doneFunc && doneFunc();
        })();
        return () => {
            controller.abort();
        }
    }
    
    useEffect(() => {
        return refreshFilesList();
    }, []);
    
    let [, setPtrDoneFunc] = useF7Ptr(refreshFilesList);
    
    return <Page
            ptr
            ptrMousewheel
            onPtrRefresh={setPtrDoneFunc}
        >
            <Navbar title={_t("AttachmentsTitle")} backLink={_t("Back")} />
            {showLoadingSkeleton ? <SkeletonFilesList /> : <FilesList files={filesList} group_id={currentGroupId} />}
            {filesList.length === 0 ? <BlockTitle className="text-align-center">{
                selectedHomeworkType === "topical" ? "Файлов в актуальных ДЗ не нашлось" :
                    selectedHomeworkType === "archive" ? "Файлов в прошлых ДЗ не нашлось" : null
            }</BlockTitle> : null}
        </Page>;
}

HomeworkAttachments = React.memo(HomeworkAttachments);

HomeworkAttachments.displayName = "HomeworkAttachments";

export default HomeworkAttachments;