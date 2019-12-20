import React from "react";
import { Popup, View } from "framework7-react";
import routes from "../../App/routes";
import GroupsSelect from "./Groups";

interface Props {
    forTheFirstTime?: boolean
}

let GroupsSelectPopup: React.FC<Props> = ({ forTheFirstTime }) => {
    return <Popup>
        <View routes={routes.groupsSelect}>
            <GroupsSelect forTheFirstTime={forTheFirstTime} />
        </View>
    </Popup>
}

GroupsSelectPopup = React.memo(GroupsSelectPopup);

export default GroupsSelectPopup;