import Axios from "axios";
import { GET_DASHBOARD_INFO, GET_ALL_USERS  } from "../constants/constants";
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

export const getAllUsers = (siteId, roleId, status) => {
  var url = `${API}/users?site_id=${siteId}&role_id=${roleId}&status=${status}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      console.log(response);
      dispatch({
        type: GET_ALL_USERS ,
        users: response.data,
      });
      return response.data
    });
  };
};
