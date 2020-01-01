import React, { useMemo, useEffect, useRef } from "react";
import { Page, Navbar, List, ListInput, Block, Button, Popup, NavLeft, Link, f7 } from "framework7-react";
import { Formik, useFormik, useField, useFormikContext, FormikHelpers } from "formik";
import serverRequest, { uploadFiles } from "../Backend";
import { FILE_UPLOAD_SIZE_LIMIT } from "../Backend/fileUpload";
import { FetchedHomework } from "../Redux/homework/types";
import { connect as reduxConnect, useSelector } from "react-redux";
import { AppState } from "../Redux/types";
import dateFormatter from "../Helpers/DateFormater";
import { editHomeworkTask, appendHomeworkTask } from "../Redux/homework/actions";
import { getUnsupportedFilesForUpload } from "../Backend/File";
import { _t } from "../Localization";
import * as Yup from "yup";

interface Props {
    taskId: number | undefined
}

let SubjectInput: React.FC<{ name: string }> = (props) => {
    let [fieldProps,] = useField(props);
    let formik = useFormikContext();
    return <ListInput
        label="Предмет"
        outline
        required
        validate
        clearButton
        autocomplete="off"
        onInputClear={() => formik.setFieldValue(props.name, "", true)}
        {...fieldProps}
    />;
}

let HomeworkInput: React.FC<{ name: string }> = (props) => {
    let [fieldProps,] = useField(props);
    let formik = useFormikContext();
    let knownSubjects = useSelector((state: AppState) => state.homework.knownSubjects);
    let inputRef = useRef(null as HTMLInputElement);
    useEffect(() => {
        if (!inputRef.current) return;
        let subjectAutocomplete = f7.autocomplete.create({
            inputEl: inputRef.current,
            openIn: "dropdown",
            source(query, render) {
                render(knownSubjects.filter(
                    subject => subject.toLowerCase().includes(query.toLowerCase())
                ));
            }
        });
        subjectAutocomplete.on("change", ([value]: [string]) => {
            formik.setFieldValue(props.name, value, true);
        });
        return () => {
            subjectAutocomplete.destroy();
        }
    }, []);
    return <ListInput
        label="Задание"
        outline
        clearButton
        // onInputClear={() => formik.setFieldValue(props.name, "", true)} // - it doesn't work
        input={false}
    >
        <input
            slot="input"
            type="text"
            autocomplete="off"
            required
            validate
            ref={inputRef}
            {...fieldProps as any}
        />
    </ListInput>;
}

let FormLayout: React.FC = () => {
    let formik = useFormikContext();
    return <form onSubmit={formik.submitForm}>
        <div className="list no-hairlines-md">
            <ul>
                <SubjectInput name="subject" />
                <HomeworkInput name="homework" />
            </ul>
        </div>
        <Block>
            <Button
                fill
                large
                disabled={Object.keys(formik.errors).length !== 0}
                type="submit"
            >
                {/* {editingMode ? "Редактировать" : "Добавить"} ДЗ */}
            </Button>
        </Block>
    </form>;
}

FormLayout = React.memo(FormLayout);

let HomeworkEditor: React.FC<Props> = (props) => {
    let { taskId: editingTaskId } = props;
    let editingMode = props.taskId !== undefined;

    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId);
    let cachedHomework = useSelector((state: AppState) => state.homework.cached[state.homework.selectedHomeworkType]);

    let validationSchema = Yup.object({
        subject: Yup.string().required(),
        homework: Yup.string().required(),
        date: Yup.date().required(),
        files: Yup.array().required()
    });

    type FormikValues = Yup.InferType<typeof validationSchema>;

    let initialValues = useMemo((): FormikValues => {
        if (editingMode) {
            for (let [day, tasks] of Object.entries(cachedHomework)) {
                for (let task of tasks) {
                    if (task.task_id !== editingTaskId) continue;
                    return {
                        subject: task.subject,
                        homework: task.homework,
                        date: new Date(day)
                    }
                }

            }
        } else {
            let dateTomorrow = new Date();
            dateTomorrow.setDate(dateTomorrow.getDate() + 1);
            return {
                subject: "",
                homework: "",
                date: dateTomorrow
            };
        }
    }, [editingMode, editingTaskId, cachedHomework]);

    let submitUserData = async (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>) => {
        if (!currentGroupId) return;
        let { subject, homework } = values,
            date = values.date[0];//todo: date is string
        if (editingMode) {
            if (editingTaskId === undefined) return;
            let { hasError } = await serverRequest("homework.Edit", {
                group_id: currentGroupId,
                task_id: editingTaskId,
                subject,
                homework
            });
            if (hasError) return;
            f7.views.current.router.back();
        } else {

            let filesEl: HTMLInputElement = document.querySelector("#append-to-homework-files-input");
            (filesEl.files.length ? uploadFiles(filesEl.files) : Promise.resolve([]))
                .then(files_id => {
                    serverRequest("homework.Add", {
                        group_id: currentGroupId,
                        date,
                        subject,
                        homework,
                        files_id
                    })
                        .then(response => {
                            if (response.hasError) return;
                            let { task_id } = response;
                            this.props.appendHomeworkTask({ task_id, subject, homework, date, files_id });
                            this.$f7.views.current.router.back();
                        });
                })
        }
    };

    type FormikValueKeys = keyof FormikValues;

    return <Popup>
        <Page>
            <Navbar title={editingMode ? "Изменение ДЗ" : "Добавление ДЗ"} >
                <Link slot="left" popupClose>{_t("ClosePopup")}</Link>
            </Navbar>
            <Formik
                initialValues={initialValues}
                onSubmit={submitUserData}
                validationSchema={validationSchema}
            >
                <FormLayout />
            </Formik>
            {/* <ListInput
                    type="file"
                    label="Прикрепленные файлы"
                    outline
                    multiple
                    disabled={this.editingMode}
                    inputId="append-to-homework-files-input"
                    onChange={() => validateForm()}
                    errorMessage={errors.file as string}
                    errorMessageForce={"file" in errors}
                >
                    <Link slot="info" onClick={this.seeRestrictions}>См. ограничения</Link>
                </ListInput> */}
            {/* <Block strong style={{ display: "none" }}>
                                <span className="calendar-day calendar-day-events" style={{ display: "inline" }}>
                                    <span className="calendar-day-event" style={{ backgroundColor: "#00ff00" }}></span>
                                </span>//TODO: calendars dots 
                                — дни, на которые больше 5 заданий
                            <br />
                                <span className="calendar-day calendar-day-events">
                                    <span className="calendar-day-event" style={{ backgroundColor: "#ff0000" }}></span>
                                </span>
                                — дни, на которые больше 5 заданий */}
            {/* </Block> */}
        </Page>
    </Popup>
}

HomeworkEditor = React.memo(HomeworkEditor);

HomeworkEditor.displayName = "HomeworkEditor";

export default HomeworkEditor;