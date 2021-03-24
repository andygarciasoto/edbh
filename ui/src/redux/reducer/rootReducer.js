import { combineReducers } from "redux";

import userReducer from "../reducer/user";
import shiftsReducer from "../reducer/shifts";

const rootReducer = combineReducers({
  user: userReducer,
  shifts: shiftsReducer,
});

export default rootReducer;
