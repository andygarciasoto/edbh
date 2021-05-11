import { GET_PARAMS, GET_LANGUAGES, GET_TIMEZONES } from "../constants/constants";

const initialState = {
  params: {},
  timezones: {},
  languages: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_PARAMS:
      return {
        ...state,
        params: { ...action.params },
      };
      case GET_TIMEZONES:
      return {
        ...state,
        timezones: { ...action.timezones },
      };
      case GET_LANGUAGES:
      return {
        ...state,
        languages: { ...action.languages },
      };
    default:
      return state;
  }
};

export const getParams = (state) => state.commonReducer.commonParams;
export const getTimezones = (state) => state.commonReducer.timezones;
