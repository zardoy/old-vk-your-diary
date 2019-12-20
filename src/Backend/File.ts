import serverRequest, { getBackendUrlBase } from ".";
import downloadjs from "downloadjs";
import { serverRequestGeneralParams } from "./serverRequest";
import { f7 } from "framework7-react";

export const supportedFileExtensionsForUpload = `
png
jpeg
jpg
pdf
svg
gif
doc
docx
html
css
htm
odt
rtf
txt
wps
xml
xps
csv
dbf
dif
ods
prn
slk
xls
xlsx
xlt
xps
bmp
odp
pot
potx
pps
ppsx
ppt
pptx
tif`.split("\n").slice(1);

export const getUnsupportedFilesForUpload = (files: File[]) => {
    files = [].slice.call(files);
    return files.filter(file => !f7.finder7.hasFileExtension(supportedFileExtensionsForUpload, file.name));
}

export interface GroupFileInfo {
    fileName: string,
    fileSize: number,
    fileId: number
}

export const fetchFilesInfo = (filesId: number[], group_id: number, fetchOptions? :serverRequestGeneralParams): Promise<GroupFileInfo[]> => {
    return filesId.reduce((prevPromise, fileId) => {
        return prevPromise.then(filesInfo => (
            getFileInfoById(fileId, group_id, fetchOptions)
                .then(fileInfo => {
                    if(fileInfo) filesInfo.push(fileInfo);
                    return filesInfo;
                })
        ))
    }, Promise.resolve([] as GroupFileInfo[]));
}

export const getFileInfoById = (file_id: number, group_id: number, fetchOptions?: serverRequestGeneralParams): Promise<GroupFileInfo> => {
    return serverRequest("file.GetInfo", {
            file_id,
            group_id,
            ...fetchOptions
        }).then(response => {
            if(response.hasError)return null;
            return {
                fileName: response.file_name,
                fileSize: response.file_size,
                fileId: response.file_id
            }
        });
}

export const downloadFileFromGroup = (file_id: number, group_id: number, file_name: string) => {
    let url = new URL(getBackendUrlBase());

    url.searchParams.append("method", "file.Get");
    url.searchParams.append("group_id", String(group_id));
    url.searchParams.append("file_id", String(file_id));
    
    
    window.open(String(url));

    // return;
    // let dialog = this.$f7.dialog.progress("Загрузка " + file_name, 0);
        
    // let url = new URL(getBackendUrlBase());
    // url.searchParams.append("method", "file.Get");
    
    // let formData = new FormData();
    // formData.append("group_id", String(this.props.currentGroupId));
    // formData.append("file_id", String(file_id));

    // let xhr = new XMLHttpRequest();

    // xhr.open("post", url.toString(), true);

    // xhr.responseType = "blob";

    // xhr.onprogress = (e) => {
    //     dialog.setProgress((e.loaded / e.total) * 100);
    // }
    
    // xhr.onload = () => {
    //     downloadjs(xhr.response, file_name);
    // }

    // xhr.onloadend = () => {
    //     dialog.close();
    // }

    // xhr.onerror = () => {
    //     this.$f7.dialog.alert("Ошибка загрузки файлв");
    // }
    
    // xhr.send(formData);
}