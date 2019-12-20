import React from "react";
import { View, Placeholder, Panel } from "@vkontakte/vkui";
import Icon56CheckCircleOutline from '@vkontakte/icons/dist/56/check_circle_outline';

const AppDummy: React.FC = () => {
    return <View activePanel="main">
        <Panel id="main">
            <Placeholder icon={<Icon56CheckCircleOutline />}>App Successfully Loaded!</Placeholder>
        </Panel>
    </View>;
}

export default AppDummy;