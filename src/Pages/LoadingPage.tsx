import React, { useEffect } from "react";
import { Page, Navbar, Block } from "framework7-react";
import { _t } from "../Localization";

let LoadingPage: React.FC = () => {
    return <Page noSwipeback noToolbar>
        <Navbar title={_t("AppNameTitle")} />
        <Block className="text-align-center">
            <div
                className="preloader"
                style={{
                    width: "42px",
                    height: "42px",
                }}
            />
            {/* FIX PRELOADER */}
        </Block>
    </Page>;
}

LoadingPage = React.memo(LoadingPage);

LoadingPage.displayName = "LoadingPage";

export default LoadingPage;