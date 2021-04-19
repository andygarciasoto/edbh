import Axios from "axios";
import { GET_REASONS, GET_REASONS_BY_SITE, GET_REASONS_BY_ASSET } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getReasons = (siteId) => {
  var url = `${API}/unique_reasons?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_REASONS,
        reasons: response.data,
      });
      return response.data;
    });
  };
};

export const getReasonsBySite = (siteId) => {
  var url = `${API}/reasons_by_site?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_REASONS_BY_SITE,
        reasons: response.data,
      });
      return response.data;
    });
  };
};

export const getReasonsByAsset = (siteId, asset_id) => {
  var url = `${API}/unique_reasons?site=${siteId}&asset_id=${asset_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_REASONS_BY_ASSET,
        reasons: response.data,
      });
      return response.data;
    });
  };
};