import Axios from "axios";
import { GET_DISPLAY, GET_WORKCELLS, GET_ASSETS } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getDisplay = (siteId) => {
  var url = `${API}/display_by_site?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_DISPLAY,
        display: response.data,
      });
      return response.data;
    });
  };
};

export const getWorkcells = (siteId) => {
  var url = `${API}/workcell_by_site?site=${siteId}`;
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