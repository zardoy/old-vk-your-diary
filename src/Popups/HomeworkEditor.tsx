import React from "react";
import { Page, Navbar, List, ListInput, Block, Button, Popup, NavLeft, Link } from "framework7-react";
import { Formik } from "formik";
import serverRequest, { uploadFiles } from "../Backend";
import { FILE_UPLOAD_SIZE_LIMIT } from "../Backend/fileUpload";
import { FetchedHomework } from "../Redux/homework/types";
import { connect as reduxConnect } from "react-redux";
import { AppState } from "../Redux/types";
import dateFormatter from "../Helpers/DateFormater";
import { editHomeworkTask, appendHomeworkTask } from "../Redux/homework/actions";
import { getUnsupportedFilesForUpload } from "../Backend/File";
import { _t } from "../Localization";

//{
interface OwnProps {
    taskId: number | undefined
}

interface StateProps {
    homework: FetchedHomework,
    currentGroupId: number,
    knownSubjects: string[]
}

interface DispatchProps {
    editHomeworkTask,
    appendHomeworkTask
}

type Props = OwnProps & StateProps & DispatchProps;
//}

interface FormValues {
    subject: string,
    homework: string,
    date: Date[]
}

interface formInputSpec {
    label: string,
    name: string,
    props?: {
        [prop: string]: any
    }
}

class HomeworkEditor extends React.Component<Props> {//todo Избавиться от глобальных IDшников на input'ах
    initialValues;
    subjectAutocomplete;
    editingTaskId;
    editingMode;
    setFieldValue;
    handleChangeSubject;

    constructor(props: Props) {
        super(props);
        this.editingTaskId = props.taskId || null;
        this.editingMode = this.editingTaskId !== null;
        this.initialValues = this.getInitialValues();
    }

    componentWillUnmount = () => {
        this.subjectAutocomplete.destroy();
    }

    componentDidMount = () => {
        this.initAutocomplete();
    }

    initAutocomplete = () => {
        this.subjectAutocomplete = this.$f7.autocomplete.create({
            inputEl: "#autocomplete-subjects-input",
            openIn: "dropdown",
            source: (...args) => this.getSubjectsByQuery(...args)//TODO
        });
        this.subjectAutocomplete.on("change", this.handleSelectAutomplete);
    }

    handleSelectAutomplete = ([value]: [string]) => {
        this.handleChangeSubject(value);
    }

    getSubjectsByQuery = (query: string, render: (...args) => any): void => {
        render(this.props.knownSubjects.filter(
            subject => subject.toLocaleLowerCase().includes(query.toLowerCase())
        ));
    }

    submitData = (values: FormValues) => {
        let { currentGroupId } = this.props;
        let { subject, homework } = values,
            date = values.date[0];//todo: date is string

        if (!this.editingMode) {
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

        } else {
            serverRequest("homework.Edit", {
                group_id: currentGroupId,
                task_id: this.editingTaskId,
                subject,
                homework
            })
                .then(response => {
                    if (response.hasError) return;
                    // this.props.editHomeworkTask();
                    this.$f7.views.current.router.back();
                });
        }
    }

    seeRestrictions = () => {//todo: to popup
        this.$f7.dialog.alert("- each file size must be less 19MB <br> - each file ... <br> - total files size must be less than 100MB <br> - you can attach less than (or equal) 10 files", "File restrictions");
    }

    getInitialValues = (): FormValues => {
        if (!this.editingMode) {
            let dateTomorrow = new Date();
            dateTomorrow.setDate(dateTomorrow.getDate() + 1);
            return {
                subject: "",
                homework: "",
                date: [dateTomorrow]
            };
        } else {
            for (let [day, tasks] of Object.entries(this.props.homework)) {
                for (let [, task] of Object.entries(tasks)) {
                    if (task.task_id !== this.editingTaskId) continue;
                    return {
                        subject: task.subject,
                        homework: task.homework,
                        date: [new Date(day)]
                    }
                }
            }
        }
    }

    validateForm = (values: FormValues) => {
        let errors = {};
        if (
            !values.subject.length ||
            !values.homework.length
        ) {
            errors["anything"] = "Required";
        }

        if (this.editingMode) {
            // for(let [name, value] of Object.entries(values)){
            //     if(name === "date")continue;
            //     if(value !== this.initialValues[name])continue;
            //     console.log(name, value);
            //     errors[name] = "Same value";
            // }//rework
            if (values.subject === this.initialValues.subject && values.homework === this.initialValues.homework) errors["anything"] = "Same value";
        } else {//VALIDATE FILE
            let fileEl: HTMLInputElement = document.querySelector("#append-to-homework-files-input");
            let files: File[] = [].slice.call(fileEl.files);
            let filesWithBigSize = files.filter(file => file.size >= FILE_UPLOAD_SIZE_LIMIT).map(file => `${file.name} (${this.$f7.finder7.getReadableFileSize(file.size)})`);
            if (filesWithBigSize.length !== 0) {//CHECK FILES SIZE
                errors["file"] = "Размер следующих файлов превышает 19 МБ: " + filesWithBigSize.join(", ");
            } else {//CHECK FILES FORMAT
                let unsupportedFiles = getUnsupportedFilesForUpload(files).map(file => file.name);
                if (unsupportedFiles.length !== 0) {
                    errors["file"] = "Формат следующих файлов не поддерживается: " + unsupportedFiles.join(", ")
                } else {
                    if (files.length >= 10) {
                        errors["file"] = "Количество файлов должно быть меньше 10";
                    }
                }
            }
        }

        return errors;
    }

    handleClearButton = (event) => {
        let target = event.target as HTMLInputElement;
        target.value = "";
        target.dispatchEvent(new Event("input"));
    }

    getEventDays = () => {
        // this.props.homework
    }

    render() {
        let formData: formInputSpec[] = [
            {
                label: "Предмет",
                name: "subject",
                props: {
                    clearButton: true,
                    inputId: "autocomplete-subjects-input",
                    maxlength: 20
                }
            },
            {
                label: "Задание",
                name: "homework",
                props: {
                    type: "textarea",
                    clearButton: true
                }
            },
            {
                label: "Дата, на которое задано",
                name: "date",
                props: {
                    type: "datepicker",
                    calendarParams: {
                        minDate: new Date(),
                        openIn: "popover",
                        formatValue: dateFormatter.bind(this, this.$f7.language),
                        closeOnSelect: true,
                        events: [
                            {
                                date: new Date(2019, 12, 1),
                                color: '#ff0000'
                            }
                        ]
                    },
                    disabled: this.editingMode//TODO
                }
            }
        ];

        //Кидать в предложку on edit back
        return <Popup>
            <Page noToolbar>

                <Navbar title={this.editingMode ? "Изменение ДЗ" : "Добавление ДЗ"}>
                    <Link slot="left" popupClose>{_t("ClosePopup")}</Link>
                </Navbar>
                <Formik
                    initialValues={this.initialValues}
                    onSubmit={this.submitData}
                    validate={this.validateForm}
                    initialErrors={{ anything: "" }}
                >{({
                    values,
                    errors,
                    handleChange,
                    handleSubmit,
                    validateForm,
                    setFieldValue
                }) => (
                        <>
                            <List noHairlinesMd>{/* TODO: onChange вызывается слишком часто */}
                                {formData.map((inputData: formInputSpec) => {
                                    let props = inputData.props || {};

                                    return <ListInput
                                        key={inputData.name}
                                        outline
                                        label={inputData.label}
                                        name={inputData.name}
                                        onChange={handleChange}
                                        value={values[inputData.name]}
                                        required
                                        autocomplete="off"
                                        validate
                                        onInputClear={e => { this.handleClearButton(e); handleChange(e) }}
                                        {...props}
                                    />;
                                })}
                                <ListInput
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
                                </ListInput>
                                {/* TODO upper text */}

                            </List>
                            {(this.handleChangeSubject = (value => setFieldValue("subject", value, true))) && false}
                            {/* Ваще идиотизм какой-то позор на всю жизнь! */}
                            {/* Переделать с useFormik! */}
                            <Block strong style={{ display: "none" }}>
                                <span className="calendar-day calendar-day-events" style={{ display: "inline" }}>
                                    <span className="calendar-day-event" style={{ backgroundColor: "#00ff00" }}></span>
                                </span>//TODO: calendars dots 
                                — дни, на которые больше 5 заданий
                            <br />
                                <span className="calendar-day calendar-day-events">
                                    <span className="calendar-day-event" style={{ backgroundColor: "#ff0000" }}></span>
                                </span>
                                — дни, на которые больше 5 заданий
                        </Block>
                            <Block>
                                <Button
                                    fill
                                    large
                                    disabled={Object.keys(errors).length !== 0}
                                    onClick={handleSubmit}
                                >
                                    {this.editingTaskId === null ? "Добавить" : "Редактировать"} ДЗ
                            </Button>
                            </Block>
                        </>
                    )}
                </Formik>
            </Page>
        </Popup>
    }
}

const mapStateToProps = (state: AppState): StateProps => ({
    homework: state.homework.cached.topical,
    knownSubjects: state.homework.knownSubjects,
    currentGroupId: state.groups.currentGroupId
})

export default reduxConnect(mapStateToProps, {
    editHomeworkTask,
    appendHomeworkTask
})(HomeworkEditor);