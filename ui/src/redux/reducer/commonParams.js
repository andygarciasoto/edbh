import { GET_PARAMS, GET_LANGUAGES, GET_TIMEZONES } from "../constants/constants";

const initialState = {
  params: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_PARAMS:
      return {
        ...state,
        params: { ...action.params },
      };
    default:
      return state;
  }
};

export const getParams = (state) => state.commonReducer.commonParams;
export const getShiftInfo = (state) => state.shiftReducer.shift_info;
