import { GET_DISPLAY } from "../constants/constants";
import { API } from "../../Utils/Constants";
import { genericRequest } from '../../Utils/Requests';

export const getDisplayFilter = (params) => {
  return (dispatch) => {
    return genericRequest('get', API, '/display_by_site', null, params).then((response) => {
      dispatch({
        type: GET_DISPLAY,
        display: response.data,
      });
      return response.data;
    });
  };
};