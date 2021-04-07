import Axios from "axios";
import { GET_REASONS, GET_REASONS_BY_SITE } from "../constants/constants";
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