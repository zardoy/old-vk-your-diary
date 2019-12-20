import React from "react";
import DiaryDay from "./DiaryDay";
import { FetchedHomework } from "../Redux/homework/types";
import { Swiper, SwiperSlide, BlockFooter } from "framework7-react";
import { useSettingValue } from "../libs/f7-settings-provider";

interface OwnProps {
    homework: FetchedHomework
}

type Props = OwnProps;

let HomeworkContent: React.FC<Props> = ({ homework }) => {
    let homeworkLength = 0;
    Object.entries(homework).forEach(([, tasks]) => {
        homeworkLength += tasks.length;
    });

    let enableSwiper = useSettingValue("useHorizontalSwiper");
    let Content;
    if(!enableSwiper){
        Content = <>
            {
                Object.entries(homework).map(([day, tasks]) => (
                    <DiaryDay key={day} dayDate={day} taskList={tasks} />
                ))
            }
            <BlockFooter className="text-align-center">Всего {homeworkLength} заданий.</BlockFooter>
        </>;
    }else{
        Content = 
            <Swiper pagination style={{height: "100%"}}>
                {Object.entries(homework).map(([day, tasks]) => (
                    <SwiperSlide key={day}>
                        <DiaryDay dayDate={day} taskList={tasks} />
                    </SwiperSlide>
                ))}
                {/* <div slot="after-wrapper" className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets"></div> */}
            </Swiper>;
    }
    
    return Content;
}

HomeworkContent = React.memo(HomeworkContent);

HomeworkContent.displayName = "HomeworkContent";

export default HomeworkContent;