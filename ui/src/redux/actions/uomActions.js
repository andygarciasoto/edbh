import Axios from "axios";
import { GET_UOM, GET_ASSETS, GET_TAGS } from "../constants/constants";
import { API } from "../../Utils/Constants";
import { genericRequest } from '../../Utils/Requests';

export const getUOM = (siteId) => {
  var url = `${API}/uom_by_site?site_id=${siteId}`;
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
  var url = `${API}/uom_by_site?site_id=${siteId}&uom_id=${uom_id}`;
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
  var url = `${API}/asset_by_site?site_id=${siteId}`;
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
  var url = `${API}/tags?site_id=${siteId}&tag_id=${tag_id}`;
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

export const getUOMFilter = (params) => {
  return (dispatch) => {
    return genericRequest('get', API, '/uom_by_site', null, params).then((response) => {
      dispatch({
        type: GET_UOM,
        users: response.data,
      });
      return response.data;
    });
  };
};
