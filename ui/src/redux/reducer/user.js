import {
  GET_DASHBOARD_INFO,
  GET_ALL_USERS,
  GET_ROLES,
  GET_USER_INFO,
} from "../constants/constants";

const initialState = {
  dashboardData: {},
  users: {},
  roles: {},
  userInfo: {},
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
    case GET_USER_INFO:
      return {
        ...state,
        userInfo: { ...action.userInfo },
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
export const getUserInfo = (state) => state.userReducer.userInfo;
export const getRoles = (state) => state.userReducer.roles;
