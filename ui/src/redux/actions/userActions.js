import Axios from "axios";
import {
  GET_DASHBOARD_INFO,
  GET_ALL_USERS,
  GET_ROLES,
  GET_USER_INFO,
  GET_ESCALATION,
  GET_SITES
} from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getDashboardInfo = (siteId) => {
  var url = `${API}/total_rows?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_DASHBOARD_INFO,
        dashboardData: response.data[0],
      });
      return response.data[0];
    });
  };
};

export const getSites = () => {
  var url = `${API}/find_sites`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_SITES,
        sites: response.data,
      });
      return response.data;
    });
  };
};

export const getAllUsers = (siteId) => {
  var url = `${API}/users?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_ALL_USERS,
        users: response.data,
      });
      return response.data;
    });
  };
};

export const getUserInfo = (siteId, badge) => {
  var url = `${API}/users?site_id=${siteId}&badge=${badge}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_USER_INFO,
        userInfo: response.data[0],
      });
      return response.data[0];
    });
  };
};

export const getRoles = () => {
  var url = `${API}/roles`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_ROLES,
        roles: response.data,
      });
      return response.data;
    });
  };
};

export const getEscalation = () => {
  var url = `${API}/escalation`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_ESCALATION,
        escalation: response.data,
      });
      return response.data;
    });
  };
};
