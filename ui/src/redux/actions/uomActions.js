import Axios from "axios";
import { GET_UOM, GET_ASSETS, GET_TAGS } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getUOM = (siteId) => {
  var url = `${API}/uom_by_site?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_UOM,
        uom: response.data,
      });
      return response.data;
    });
  };
};

export const getUOMById = (siteId, uom_id) => {
  var url = `${API}/uom_by_site?site=${siteId}&uom_id=${uom_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_UOM,
        uom: response.data,
      });
      return response.data;
    });
  };
};

export const getAssets = (siteId) => {
	var url = `${API}/asset_by_site?site=${siteId}`;
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

export const getTagById = (siteId, tag_id) => {
	var url = `${API}/tags?site=${siteId}&tag_id=${tag_id}`;
	return (dispatch) => {
		return Axios.get(url).then((response) => {
			dispatch({
				type: GET_TAGS,
				tags: response.data,
			});
			return response.data;
		});
	};
};
