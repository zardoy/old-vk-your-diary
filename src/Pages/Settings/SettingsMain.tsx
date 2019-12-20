import React, { useMemo } from "react";
import { Page, Navbar, BlockTitle, List, ListItem, Icon, BlockFooter, f7, Toolbar, Link, ListButton } from "framework7-react";
import { _t } from "../../Localization";
import { useSelector } from "react-redux";
import { AppState } from "../../Redux/types";
import { getSelectedGroupInfo } from "../../Redux/groups/selectors";
import getGroupActions from "../../Helpers/GroupActions";
import { SettingsList } from "../../libs/f7-settings-provider";

import Icon24UserOutgoing from '@vkontakte/icons/dist/24/user_outgoing';
import Icon24Link from '@vkontakte/icons/dist/24/link';

const goToGroupsSelect = () => {
    f7.views.current.router.navigate("/groupsSelect/");
}

let SettingsTab: React.FC = () => {
    let currentGroupId = useSelector((state: AppState) => state.groups.currentGroupId)
    let selectedGroupInfo = useSelector(getSelectedGroupInfo)//todo: optimize it

    let { showGroupToken, propmtGenerateNewToken, shareJoinLink } = useMemo(() => getGroupActions(currentGroupId), [ currentGroupId ]);
    
    return <Page>
        <Navbar title={_t("Settings")} />
        <BlockTitle medium className="user-select-text">{selectedGroupInfo.group_name}</BlockTitle>
        {/* <Block strong style={!props.selectedGroupInfo.group_description && { display: "none" }} className="user-select-text">
            {props.selectedGroupInfo.group_description}
        </Block> */}
        <BlockTitle>{_t("GroupTitle")}</BlockTitle>
        <List mediumInset>
            {/* TODO */}
            <ListItem onClick={goToGroupsSelect} link="#" color="link" title="Сменить группу">
                <Icon24UserOutgoing slot="media" />
            </ListItem>
            {/* <ListItem onClick={() => openPopup("changeGroupName")} link="#" color="link">
                <Icon material="edit" slot="media" />
                Изменить имя группы
            </ListItem>
            <ListItem onClick={() => openPopup("changeGroupDescription")} link="#" color="link">
                <Icon f7="pencil_ellipsis_rectangle" slot="media" />
                Редактировать описание группы
            </ListItem> */}
            <ListItem disabled onClick={shareJoinLink} link="#" color="link" title={_t("ShareInvite")}>
                <Icon24Link slot="media" />
            </ListItem>
        </List>
        <BlockTitle>Ключ группы</BlockTitle>
        <List>
            <ListItem onClick={showGroupToken} link="#" title="Показать ключ группы">
                <Icon size="24px" material="vpn_key" slot="media" />
            </ListItem>
            <ListItem onClick={propmtGenerateNewToken} link="#" title="Сгенерировать новый ключ группы">
                <Icon size="24px" material="refresh" slot="media" />
            </ListItem>
            <BlockFooter>
                Ключ группы и токен группы — одно и то же
            </BlockFooter>
        </List>
        <SettingsList listName="diarySettings" />
        <BlockFooter>v{f7.version}</BlockFooter>
    </Page>
}

SettingsTab = React.memo(SettingsTab);

SettingsTab.displayName = "SettingsTab";

export default SettingsTab;