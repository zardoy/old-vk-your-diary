import React from "react";
import { BlockTitle, Card, List, ListItem, Icon, Badge, f7 } from "framework7-react";
import { HomeworkData } from "../Redux/homework/types";
import { useSettingValue } from "../libs/f7-settings-provider";

interface OwnProps {
    dayDate: Date | string,
    taskList: HomeworkData[]
}

type Props = OwnProps;

const openTaskPage = (taskId: number) => {
    f7.views["main"].router.navigate("/homeworkTask/", {
        props: {
            taskId
        }
    });
}

let DiaryDay: React.FC<Props> = (props) => {
    let { taskList, dayDate } = props;

    let dayTitle = new Date(dayDate).toLocaleDateString(f7.language, {
        weekday: "long",
        day: "numeric",
        month: "short"
    });
    dayTitle = dayTitle[0].toLocaleUpperCase() + dayTitle.slice(1);
    let useCheckbox = useSettingValue("rememberCompleteTasks");
    return <>
        <BlockTitle medium>{dayTitle}</BlockTitle>
        <Card outline={false}>
            <List mediaList>
                {taskList.map((task) => {
                    return <ListItem
                        key={task.task_id}
                        title={task.subject}
                        text={task.homework}
                        checkbox={useCheckbox}
                        onClick={() => openTaskPage(task.task_id)}
                    >
                        {task.files.length ?
                            <div slot="after">
                                <Icon f7="doc">
                                    {task.files.length === 1 ? null :
                                        <Badge color="red">{task.files.length}</Badge>
                                    }
                                </Icon>
                            </div>
                            : null}
                    </ListItem>
                })}
            </List>
        </Card>
    </>;
}

DiaryDay = React.memo(DiaryDay);

export default DiaryDay