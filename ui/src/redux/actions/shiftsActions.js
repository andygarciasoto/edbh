import Axios from "axios";
import { GET_SHIFTS, GET_SHIFT_INFO } from "../constants/constants";
import { API } from "../../Utils/Constants";
import { genericRequest } from '../../Utils/Requests';

export const getShifts = (siteId) => {
  var url = `${API}/shifts?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_SHIFTS,
        shifts: response.data,
      });
      return response.data;
    });
  };
};

export const getShiftInfo = (siteId, shift_id) => {
  var url = `${API}/shifts?site_id=${siteId}&shift_id=${shift_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_SHIFT_INFO,
        shift_info: response.data,
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
        users: response.data,
      });
      return response.data;
    });
  };
};