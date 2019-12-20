import React, { useCallback } from "react";
import { Icon, Button, Navbar, Popup, Link, f7 } from "framework7-react";
import serverRequest from "../Backend";
import { removeInviteParam, getGroupTokenFromUrl } from "../Helpers/URLParams";

let JoinGroupPopup: React.FC = () => {
    
    let joinGroup = useCallback(async () => {
        let { hasError } = await serverRequest("group.Join", {
            token: getGroupTokenFromUrl()
        });
        if(hasError)return;
        f7.views.current.router.navigate("/groupsSelect/");
    }, []);
    
    return <Popup onPopupClose={removeInviteParam} id="url-has-group-key-to-join">
        <Navbar title="Передан ключ группы" large>
            <Link slot="left" popupClose>Отмена</Link>
        </Navbar>
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Icon f7="person_badge_plus" size={70} />
            {/* add group info */}
            <Button raised fill large onClick={joinGroup}>Присоединиться к группе</Button>
        </div>
        {/* <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            flexDirection: "column"
        }}>
            <Icon f7="person_badge_plus" size={70} />
            <Button raised fill large onClick={this.joinToGroup}>Присоединиться к группе</Button>
            <Button raised large onClick={this.cancelClickHandler}>Отмена</Button>
        </div> */}
    </Popup>
}

JoinGroupPopup = React.memo(JoinGroupPopup);

export default JoinGroupPopup;