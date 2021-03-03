import { GET_SHIFTS } from "../constants/constants";

const initialState = {
  shifts: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_SHIFTS:
      return {
        ...state,
        shifts: { ...action.shifts },
      };
    default:
      return state;
  }
};

export const getShifts = (state) => state.userReducer.shifts;
