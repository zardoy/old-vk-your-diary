import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BlockFooter, Page, Toolbar, Link, f7, Navbar, Subnavbar, Searchbar, Segmented, Button } from "framework7-react";
import { AppState } from "../../Redux/types";
import { FetchedHomework, SelectedHomeworkType, HomeworkData } from "../../Redux/homework/types";
import { fetchNewHomework, fetchMoreHomeworkFromArchive, setSelectedHomeworkType } from "../../Redux/homework/actions";
import HomeworkContent from "../../Components/HomeworkContent";
import HomeworkSkeleton from "../../Components/HomeworkSkeleton";
import { _t } from "../../Localization";

const getNotFoundText = (homeworkType: SelectedHomeworkType, searchMode: boolean) => {
    return searchMode ? "По этому запросу ничего не нашлось" :
        homeworkType === "topical" ? "В актуальных заданиях пусто" :
        homeworkType === "archive" ? "В архиве пока ничего нет" : null;
}

const openHomeworkAttachments = () => {
    f7.views.current.router.navigate("/homeworkAttachments/");
}

const newHomework = () => {
    f7.views.current.router.navigate("/homeworkEditor/");
}

let HomeworkView: React.FC<{ homework: FetchedHomework, noHomeworkText: string }> = ({ homework, noHomeworkText }) => {
    if (homework === null) {
        return <HomeworkSkeleton />;
    } else if (Object.keys(homework).length === 0) {
        return <BlockFooter className="text-align-center">{noHomeworkText}</BlockFooter>;
    } else {
        return <HomeworkContent homework={homework} />;
    }
}

HomeworkView = React.memo(HomeworkView);

HomeworkView.displayName = "HomeworkView";

let HomeworkTab: React.FC = () => {
    let [moreHomeworkIsLoading, setMoreHomeworkIsLoading] = useState(false);
    let [searchQuery, setSearchQuery] = useState(null as string);

    let dispatch = useDispatch();

    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId);
    let cachedHomework = useSelector((state: AppState) => state.homework.cached[state.homework.selectedHomeworkType]);
    let selectedHomeworkType = useSelector((state: AppState) => state.homework.selectedHomeworkType);
    let archiveEndReached = useSelector((state: AppState) => state.homework.endReached.archive);

    const loadMoreArchiveHomework = async () => {
        if (moreHomeworkIsLoading) return;
        setMoreHomeworkIsLoading(true);
        await dispatch(fetchMoreHomeworkFromArchive(currentGroupId, {
            showLoader: false
        }));
        setMoreHomeworkIsLoading(false);
    }

    const searchContent = (task: HomeworkData) => {
        return task.subject.includes(searchQuery) || task.homework.includes(searchQuery);
    }

    const getFilteredHomework = () => {
        return Object.fromEntries(
            Object.entries(cachedHomework)
                .map(([day, homework]) => {
                    return [day, homework.filter(searchContent)];
                })
                .filter(([, tasks]) => {
                    return tasks.length !== 0;
                })
        );
    }

    const refreshHomework = async (done = () => { }) => {
        await dispatch(fetchNewHomework(currentGroupId, selectedHomeworkType, {
            showLoader: false
        }));
        done();
    }

    const getNavbarEl = () => {
        return f7.navbar.getElByPage(f7.views.current.el.querySelector(".page-current") as HTMLElement);
    }

    const enableSearchbar = () => {
        // f7.navbar.hide(getNavbarEl());
    }

    const disableSearchbar = () => {
        // f7.navbar.show(getNavbarEl());
        setSearchQuery(null);
    }

    let setHomeworkType = useCallback((homeworkType: SelectedHomeworkType) => {
        dispatch(setSelectedHomeworkType(homeworkType));
    }, [ dispatch ])

    useEffect(() => {
        let controller = new AbortController();
        if (cachedHomework === null) {
            dispatch(fetchNewHomework(currentGroupId, selectedHomeworkType, {
                showLoader: false,
                fetchOptions: {
                    signal: controller.signal
                }
            }));
        }
        return () => {
            controller.abort();
        }
    }, [ currentGroupId, selectedHomeworkType, cachedHomework, dispatch ]);

    return <Page
            ptr
            ptrMousewheel
            onPtrRefresh={refreshHomework}
            infinite={selectedHomeworkType === "archive"}
            onInfinite={loadMoreArchiveHomework}
            infinitePreloader={archiveEndReached}
        >
            <Navbar title={_t("AppNameTitle")}>
                <Link slot="left" iconOnly iconF7="plus" iconMd="material:add" onClick={newHomework} />
                <Subnavbar>
                    <Link className="searchbar-hide-on-enable" searchbarEnable="#homework-searchbar" iconOnly iconF7="search" iconMd="material:search" />
                    <Searchbar 
                        id="homework-searchbar" 
                        customSearch 
                        expandable 
                        onSearchbarEnable={enableSearchbar}
                        onSearchbarSearch={(_searchbar, query: string) => setSearchQuery(query)} 
                        onSearchbarDisable={disableSearchbar} 
                    />
                    <Segmented className="searchbar-hide-on-enable" strong>
                        <Button active={selectedHomeworkType === "topical"} onClick={setHomeworkType.bind(this, "topical")}>Актуальное</Button>
                        <Button active={selectedHomeworkType === "archive"} onClick={setHomeworkType.bind(this, "archive")}>Архив</Button>
                    </Segmented>
                    <Link className="searchbar-hide-on-enable" iconF7="paperclip" iconOnly onClick={openHomeworkAttachments} />
                </Subnavbar>
            </Navbar>
            <HomeworkView
                noHomeworkText={getNotFoundText(selectedHomeworkType, searchQuery !== null)}
                homework={searchQuery ? getFilteredHomework() : cachedHomework}
            />
        </Page>
}

HomeworkTab = React.memo(HomeworkTab);

HomeworkTab.displayName = "HomeworkTab";

export default HomeworkTab;