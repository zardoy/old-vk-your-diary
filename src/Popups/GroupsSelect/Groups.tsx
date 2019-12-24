import React, { useState, useCallback, useEffect } from "react";
import { Page, Navbar, BlockTitle, List, ListItem, Block, Actions, ActionsGroup, ActionsLabel, ActionsButton, SwipeoutActions, SwipeoutButton, BlockFooter, Icon, f7, Popup, Link, View } from "framework7-react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../Redux/types";
import { setCurrentGroupId, setGroupsInfo } from "../../Redux/groups/actions";
import vkConnect from "@vkontakte/vk-connect";
import { handleVkConnectError } from "../../Helpers/VKConnectHelper";
import serverRequest from "../../Backend";
import { _t } from "../../Localization";
import { useF7Ptr, useF7PopoutControl } from "../../Hooks/F7";
import { setSelectedHomeworkType, resetFetchedHomework } from "../../Redux/homework/actions";
import { getTokenFromQRCode } from "../../Helpers/URLParams";

interface Props {
    forTheFirstTime?: boolean
}

const AddGroupList: React.FC<{ onClick: (...args) => any }> = ({ onClick }) => {
    return <List>
        <ListItem title={_t("AddGroup")} onClick={onClick} link="#">
            <Icon slot="media" material="add_circle" color="green" />
        </ListItem>
    </List>;
}

const openTokenForm = () => {
    f7.views["groupsSelect"].router.navigate("/enterToken/");//todo: popup view
}

let GroupsSelect: React.FC<Props> = (props) => {
    let [showGroupsSkeleton, setShowGroupsSkeleton] = useState(false);

    let cachedGroups = useSelector((state: AppState) => state.groups.savedGroups);
    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId);
    let groupsLimitReached = useSelector((state: AppState) => state.groups.limitReached);


    let selectRequired = currentGroupId === null;
    let [isAddGroupActionsOpen, openAddGroupActions, closeAddGroupActions] = useF7PopoutControl(false);

    let dispatch = useDispatch();

    const openDiaryWithGroup = (groupId: number) => {
        if (f7.swipeout.el) return;
        dispatch(setSelectedHomeworkType("topical"));
        dispatch(setCurrentGroupId(groupId, true));
        f7.tab.show("#diary-tab");
        f7.views["diary"].router.navigate("/");
    }

    const createGroup = () => {
        let callback = async () => {
            let { hasError } = await serverRequest("group.Create", {});
            if (hasError) return;
            refreshGroupsNotFromPtr();
        };
        f7.simplePopups.confirm({
            title: _t("ConfirmAction"),
            text: "Для вас будет создана новая группа. Новых людей можно пригласить через настройки",
            verticalButtons: true,
            confirmButton: {
                text: "Создать группу",
                onClick: callback
            }
        });
    };

    const leaveGroup = (group_id: number) => {
        const closeSwipeout = () => {
            f7.swipeout.close(f7.swipeout.el || null);
        };
        const callback = async () => {
            let { hasError } = await serverRequest("group.Leave", { group_id });
            if (hasError) {
                closeSwipeout();
            } else {
                if (group_id === currentGroupId) {
                    dispatch(setCurrentGroupId(null, true));
                    dispatch(resetFetchedHomework());
                }
                let swipeoutEl = f7.swipeout.el;
                if (swipeoutEl) {
                    f7.swipeout.delete(swipeoutEl, () => {
                        // dispatch(deleteSavedGroup(group_id)); TODO
                        // refreshGroupsNotFromPtr();
                    });
                } else {
                    refreshGroupsNotFromPtr();
                }
            }
        }
        f7.simplePopups.confirm({
            title: _t("ConfirmAction"),
            text: "Покинув группу, вы больше не сможете вернуться в нее без её токена",
            verticalButtons: true,
            cancelButtonClick: closeSwipeout,
            confirmButton: {
                text: _t("LeaveGroupConfirm"),
                level: "danger",
                onClick: callback
            }
        });
    }

    const scanQR = async () => {
        try {
            let data: any = await vkConnect.sendPromise("VKWebAppOpenQR");

            let { hasError } = await serverRequest("group.Join", {
                token: getTokenFromQRCode(data.qr_data || data.code_data)
            });
            if (hasError) return;
            refreshGroupsNotFromPtr();
        } catch (err) {
            handleVkConnectError("Не удалось отсканировать QR", err);
        }
    }

    const refreshGroups = (doneFunc?: () => void) => {
        let controller = new AbortController();
        if (!doneFunc) {
            setShowGroupsSkeleton(true);
        }

        (async () => {
            let { hasError, groups, limitReached } = await serverRequest("user.GetGroups", {
                showLoader: false,
                fetchOptions: {
                    signal: controller.signal
                }
            });

            setShowGroupsSkeleton(false);
            doneFunc && doneFunc();

            if (hasError) return;

            dispatch(setGroupsInfo(groups, limitReached));
        })();
        return () => {
            controller.abort();
        }
    }

    const refreshGroupsNotFromPtr = useCallback(() => refreshGroups(), [dispatch]);

    let [, setPtrDoneFunc] = useF7Ptr(refreshGroups);

    useEffect(() => {
        if (!cachedGroups) return refreshGroups();
    }, []);

    let GroupsComponent: React.ReactChild;

    if (showGroupsSkeleton) {
        GroupsComponent =
            <List className="skeleton-text skeleton-effect-blink">
                <ListItem title="Group 123" link />
                <ListItem title="Group 231231" link />
                <ListItem title="Group 3" link />
            </List>;
    } else if (cachedGroups === null) {
        GroupsComponent =
            <List>
                <ListItem title="Загрузить группы" link="#" onClick={refreshGroupsNotFromPtr} />
            </List>;
    } else if (cachedGroups.length === 0) {
        GroupsComponent = <AddGroupList onClick={openAddGroupActions} />;
    } else {
        GroupsComponent =
            <List>
                {cachedGroups.map((groupInfo, i) =>
                    <ListItem
                        swipeout
                        title={groupInfo.group_name || "Группа " + (i + 1)}
                        key={i}
                        onClick={openDiaryWithGroup.bind(this, groupInfo.group_id)}
                        link
                    >
                        <Icon slot="media" material="group" />
                        <SwipeoutActions right>
                            <SwipeoutButton text="Выйти" color="red" onClick={leaveGroup.bind(this, groupInfo.group_id)} />
                        </SwipeoutActions>
                    </ListItem>
                )}
                {groupsLimitReached ? null :
                    <ListItem title={_t("AddGroup")} onClick={openAddGroupActions} link>
                        <Icon slot="media" material="add_circle" color="green" />
                    </ListItem>
                }
            </List>;
    }

    return <Page noSwipeback={!selectRequired} ptr ptrMousewheel onPtrRefresh={setPtrDoneFunc}>
        <Navbar title="Вход в группу">
            {!selectRequired && <Link slot="left" text={_t("ClosePopup")} popupClose />}
        </Navbar>
        {!props.forTheFirstTime ?
            <>
                <BlockTitle>Группы, в которых сейчас состоите:</BlockTitle>
                {GroupsComponent}
            </> :
            <Block strong>{_t("GroupsWelcomeText")}</Block>
        }
        {/* <Block>
                    <Button fill large disabled={addGroupButtonDisabled} className={savedGroups.length === 0 ? "for_the_first_time_blinking_button" : ""} onClick={() => this.setState({ showAddGroupActions: true })}>
                        Добавить группу
                    </Button>
                </Block> */}
        <BlockFooter>Можно добавить до 5 групп</BlockFooter>

        <Actions opened={isAddGroupActionsOpen} convertToPopover onActionsClosed={closeAddGroupActions}>
            <ActionsGroup>
                <ActionsLabel>Добавить группу</ActionsLabel>
                {null && <ActionsButton onClick={openTokenForm}>Ввести ключ (токен)</ActionsButton>}
                {!vkConnect.supports("VKWebAppOpenQR") || f7.device.android ? null : <ActionsButton onClick={scanQR}>Отсканировать QR</ActionsButton>}
                <ActionsButton onClick={createGroup}>Создать группу</ActionsButton>
            </ActionsGroup>
            <ActionsGroup>
                {f7.device.ios ? <ActionsButton color="red">{f7.params.dialog.buttonCancel}</ActionsButton> : null}
            </ActionsGroup>
        </Actions>
    </Page>;
}

GroupsSelect = React.memo(GroupsSelect);

GroupsSelect.displayName = "GroupsSelect";

export default GroupsSelect;