import { combineReducers } from "redux";
import HomeworkReducer from "./homework/reducers";
import GroupsReducer from "./groups/reducers";

export default combineReducers({
    homework: HomeworkReducer,
    groups: GroupsReducer
});