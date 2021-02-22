import { GET_DASHBOARD_INFO } from "../constants/constants";

const initialState = {
  dashboardData: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DASHBOARD_INFO:
      return {
        ...state,
        dashboardData: {...action.dashboardData},
      };

    default:
      return state;
  }
};



export const GetDashboardInfo = state => state.userReducer.dashboardData;
