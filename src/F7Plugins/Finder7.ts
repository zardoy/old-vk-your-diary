import { Framework7Plugin, Framework7Class, default as f7Class } from "framework7/components/app/app-class";
import Framework7 from "framework7";

declare module "framework7/components/app/app-class" {
    interface Framework7Class<Events> extends Plugin { }
}

interface FileInfo {
    name: string,
    size: number,
    // lastModified?: Date
}

interface OpenFileParameters {
    file: File | {
        /** warning: if downloadIfNotSupported is true (by default), then url will be opened in window: window.open(url) */
        url: string,
        fileName?: string,
    },
    /** default -- true, downloads the file if the file extensions is not supported */
    downloadIfNotSupported?: boolean,
    fileInfo?: Partial<FileInfo>,
    on: {
        fileChange?(fileInfo: FileInfo): void
    }
}

interface FileViewer {
    close(): void,
    getFileInfo(): FileInfo
}


interface Plugin {
    finder7: {
        // openFileInViewer(options: { file: File | { url: string, }}): FileViewer
        getFileExtension(file: File): string,
        getFileExtension(fileName: string): string,
        getReadableFileSize(file: File): string,
        getReadableFileSize(fileSizeInBytes: number): string,
        hasFileExtension(fileExtensions: string[], extensionToSearch: string): boolean
        hasFileExtension(files: File[], extensionToSearch: string): boolean,
        // equalFileExtensions(file1: File, file2: File): boolean,
        normalizeFileName(file: File): string,
        normalizeFileName(fileName: string): string,
    }
}

const getFileName = (file: File | string): string => {
    if (typeof file !== "string") {
        return file.name;
    } else {
        return file;
    }
}

export default {
    name: "finder7",
    create() {
        let app: Framework7 = this;
        app.finder7 = {
            getReadableFileSize(file: number | File) {
                let fileSizeInBytes: number;
                if (typeof file !== "number") {
                    fileSizeInBytes = file.size;
                } else {
                    fileSizeInBytes = file;
                }
                var i = 0;
                var byteUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                while (fileSizeInBytes > 1024) {
                    fileSizeInBytes = fileSizeInBytes / 1024;
                    i++;
                }

                return fileSizeInBytes.toFixed(1) + " " + byteUnits[i];
            },
            getFileExtension(file: File | string) {
                let fileName = getFileName(file);
                let [, ...fileNameParts] = fileName.split(".");
                return (fileNameParts.pop() || "").toLowerCase();
            },
            hasFileExtension(files: File[] | string[], extensionToSearch: string) {
                let fileExtensions: Array<String>;
                if (typeof files[0] !== "string" && files[0].name) {
                    fileExtensions = (files as Array<File>).map(file => file.name);
                } else {
                    fileExtensions = files as Array<String>;
                }
                return fileExtensions.map(fileName => fileName.toLowerCase()).includes(app.finder7.getFileExtension(extensionToSearch));
            },
            normalizeFileName(file: File | string) {
                let fileName = getFileName(file);
                let splittedFileName = fileName.split(".");
                if (splittedFileName.length === 1) return fileName;
                splittedFileName.push(
                    splittedFileName.pop().toLowerCase()
                );
                return splittedFileName.join(".");
            }
        }
    }
} as any as Framework7Plugin