import Axios from "axios";
import { GET_DISPLAY, GET_WORKCELLS, GET_ASSETS } from "../constants/constants";
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

export const getAssetsLevel = (siteId) => {
	var url = `${API}/asset_by_site?site=${siteId}&level=cell`;
	return (dispatch) => {
		return Axios.get(url).then((response) => {
			dispatch({
				type: GET_ASSETS,
				assets: response.data,
			});
			return response.data;
		});
	};
};