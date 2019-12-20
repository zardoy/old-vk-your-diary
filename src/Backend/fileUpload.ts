import { f7 } from "framework7-react";
import { getBackendUrlBase, ServerError } from ".";
import { _t } from "../Localization";

export const FILE_UPLOAD_SIZE_LIMIT = 19_922_944;

export const uploadFiles = (fileList: FileList): Promise<number[]> => {
    let files = [].slice.call(fileList);
    
    let totalFilesSize = files.map(file => file.size).reduce((prevSize, currentSize) => prevSize + currentSize);
    
    f7.fileUploadGauge.show({
        labelText: "Подключение..."
    });

    let uploadedSize = 0, currentFile = 1;
    function handleUploadProgress(uploadEvent: ProgressEvent) {
        let perc = (uploadedSize + uploadEvent.loaded) / totalFilesSize;
        if(isFinite(perc))perc = 0;
        f7.fileUploadGauge.update({
            value: perc,
            valueText: Math.floor(perc * 100) + "%",
            labelText: _t("UploadingFilesLabel", { currentFile, filesTotal: files.length })
        });
    }
    return files.reduce(async (prevPromise, file) => {
        let filesId = await prevPromise;
        let uploadedFileId = await uploadFile(file, handleUploadProgress);
        uploadedSize += file.size;
        currentFile++;
        return [...filesId, uploadedFileId];
    }, Promise.resolve([]))
        .finally(() => f7.fileUploadGauge.close())
}

function uploadFile(file: File, showProgressCallback: (e: ProgressEvent) => void): Promise<number> {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = new URL(getBackendUrlBase());
        let formData = new FormData();
        
        url.searchParams.append("method", "file.Upload");
        xhr.responseType = "json";
        xhr.open("post", url.toString(), true);

        formData.append("uploadfile", file, f7.finder7.normalizeFileName(file.name));

        xhr.onerror = reject;

        xhr.upload.onprogress = showProgressCallback;

        xhr.onload = () => {
            if(xhr.response.error){
                reject(new ServerError({
                    message: xhr.response.error.message, 
                    error_code: xhr.response.error.error_code, 
                    method_name: "file.Upload"
                }));
            }else{
                resolve(+xhr.response.file_id);
            }
        }

        xhr.send(formData);
    })
}