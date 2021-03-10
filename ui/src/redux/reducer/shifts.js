import { GET_SHIFTS, GET_SHIFT_INFO } from "../constants/constants";

const initialState = {
  shifts: {},
  shift_info:{}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_SHIFTS:
      return {
        ...state,
        shifts: { ...action.shifts },
      };
      case GET_SHIFT_INFO:
      return {
        ...state,
        shift_info: { ...action.shift_info },
      };
    default:
      return state;
  }
};

export const getShifts = (state) => state.userReducer.shifts;
export const getShiftInfo = (state) => state.userReducer.shift_info;
