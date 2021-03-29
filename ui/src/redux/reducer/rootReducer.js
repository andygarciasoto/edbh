import { combineReducers } from "redux";

import userReducer from "../reducer/user";
import shiftsReducer from "../reducer/shifts";
import commonReducer from "../reducer/commonParams";

const rootReducer = combineReducers({
  user: userReducer,
  shifts: shiftsReducer,
  commonParams: commonReducer
});

export default rootReducer;
