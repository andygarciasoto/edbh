import { GET_DASHBOARD_INFO, GET_ALL_USERS, GET_ROLES } from "../constants/constants";

const initialState = {
  dashboardData: {},
  users: {},
  roles:{},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DASHBOARD_INFO:
      return {
        ...state,
        dashboardData: { ...action.dashboardData },
      };
    case GET_ALL_USERS:
      return {
        ...state,
        users: { ...action.users },
      };
      case GET_ROLES:
        return {
          ...state,
          roles: { ...action.roles },
        };

    default:
      return state;
  }
};

export const GetDashboardInfo = (state) => state.userReducer.dashboardData;
export const getAllUsers = (state) => state.userReducer.users;
export const getRoles = (state) => state.userReducer.roles;
