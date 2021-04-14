import Axios from "axios";
import { GET_BREAK, GET_BREAK_BY_SITE, GET_SHIFTS } from "../constants/constants";
import { API } from "../../Utils/Constants";
import { genericRequest } from '../../Utils/Requests';

export const getBreak = (siteId) => {
  var url = `${API}/unique_unavailable?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_BREAK,
        break: response.data,
      });
      return response.data;
    });
  };
};

export const getBreakBySite = (siteId) => {
  var url = `${API}/unavailable?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_BREAK_BY_SITE,
        break: response.data,
      });
      return response.data;
    });
  };
};

export const getBreakFilter = (params) => {
  return (dispatch) => {
    return genericRequest('get', API, '/unique_unavailable', null, params).then((response) => {
      dispatch({
        type: GET_BREAK,
        break: response.data,
      });
      return response.data;
    });
  };
};

export const getShiftsFilter = (params) => {
  return (dispatch) => {
    return genericRequest('get', API, '/shifts', null, params).then((response) => {
      dispatch({
        type: GET_SHIFTS,
        shifts: response.data,
      });
      return response.data;
    });
  };
};