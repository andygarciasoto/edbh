import Axios from "axios";
import { GET_DASHBOARD_INFO, GET_ALL_USERS, GET_ROLES  } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getDashboardInfo = (siteId) => {
  var url = `${API}/total_rows?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_DASHBOARD_INFO,
        dashboardData: response.data[0],
      });
      return response.data[0]
    });
  };
};

export const getAllUsers = (siteId) => {
  var url = `${API}/users?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_ALL_USERS ,
        users: response.data,
      });
      return response.data
    });
  };
};

export const getRoles = () => {
  var url = `${API}/roles`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_ROLES ,
        roles: response.data,
      });
      return response.data
    });
  };
};
