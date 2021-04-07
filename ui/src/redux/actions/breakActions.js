import Axios from "axios";
import { GET_BREAK, GET_BREAK_BY_SITE } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getBreak = (siteId) => {
  var url = `${API}/unique_unavailable?site=${siteId}`;
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