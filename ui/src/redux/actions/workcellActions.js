import Axios from "axios";
import { GET_WORKCELLS } from "../constants/constants";
import { API } from "../../Utils/Constants";
import { genericRequest } from '../../Utils/Requests';

export const getWorkcells = (siteId) => {
  var url = `${API}/workcell_by_site?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_WORKCELLS,
        workcells: response.data,
      });
      return response.data;
    });
  };
};

export const getWorkcellById = (siteId, workcell_id) => {
  var url = `${API}/workcell_by_site?site_id=${siteId}&workcell_id=${workcell_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_WORKCELLS,
        workcells: response.data,
      });
      return response.data;
    });
  };
};

export const getWorkcellsFilter = (params) => {
  return (dispatch) => {
    return genericRequest('get', API, '/workcell_by_site', null, params).then((response) => {
      dispatch({
        type: GET_WORKCELLS,
        workcells: response.data,
      });
      return response.data;
    });
  };
};