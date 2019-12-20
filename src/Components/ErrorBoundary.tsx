import React, { ReactChild, Suspense } from "react";
import { logApplicationErrorToServer } from "../Backend";
import Framework7 from "framework7";
import * as URLParamsHelper from "../Helpers/URLParams";
import { Popup, Button, BlockTitle, Page, View, Block, Navbar } from "framework7-react";
import { _t } from "../Localization";


interface props {
    children: ReactChild
}

class ErrorBoundary extends React.Component<props> {
    state = {
        hasError: false
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true
        };
    }

    componentDidCatch(error: Error){
        logApplicationErrorToServer(error, "Render Crash");
    }

    render() {
        if(this.state.hasError){
            return (
                <View>
                    <Page>
                        <Navbar title={_t("ServiceRenderCrashTitle")} large />
                        <Block>
                            <Button raised fill onClick={() => window.location.reload(true)}>{_t("ReloadAppWithoutCache")}</Button>
                            <Button 
                                className="margin-top"
                                raised 
                                onClick={() => window.location.reload(true)} 
                                target="_blank" 
                                external 
                                href="mailto:dnevnik@somecrap.ru?subject=Render Crash Report"
                            >{_t("ContactToDeveloper")}</Button>
                        </Block>
                    </Page>
                </View>
            );
        }
        
        return this.props.children;
    }
    
}

export default ErrorBoundary;