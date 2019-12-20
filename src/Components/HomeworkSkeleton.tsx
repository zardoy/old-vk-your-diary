import React from "react";
import { BlockTitle, Card, List, ListItem } from "framework7-react";

let HomeworkSkeleton: React.FC = () => {
    return <div className="skeleton-effect-blink">
        <BlockTitle medium className="skeleton-text">Thursday, 21 November</BlockTitle>
        <Card outline={false}>
            <List mediaList>
                {[1, 2, 3, 4].map(n => {
                    return <ListItem
                        key={n}
                        title="Subject Name"
                        className="skeleton-text"
                        text="____ ___ __ _______ ____"
                        link="#"
                    />
                })}
            </List>
        </Card>
    </div>;
}

HomeworkSkeleton = React.memo(HomeworkSkeleton);

HomeworkSkeleton.displayName = "HomeworkSkeleton";

export default HomeworkSkeleton;