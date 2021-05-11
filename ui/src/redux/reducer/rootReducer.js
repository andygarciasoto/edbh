import { combineReducers } from "redux";

import userReducer from "../reducer/user";
import shiftsReducer from "../reducer/shifts";
import commonReducer from "../reducer/commonParams";
import uomReducer from "../reducer/uom";
import displayReducer from "../reducer/display";
import reasonsReducer from "../reducer/reasons";
import breakReducer from "../reducer/break";
import workcellReducer from "../reducer/workcell";
import assetsReducer from "../reducer/assets";
import tagsReducer from "../reducer/tags";

const rootReducer = combineReducers({
  user: userReducer,
  shifts: shiftsReducer,
  commonParams: commonReducer,
  uom: uomReducer,
  display: displayReducer,
  reasons: reasonsReducer,
  break: breakReducer,
  workcells: workcellReducer,
  assets: assetsReducer,
  tags: tagsReducer
});

export default rootReducer;
