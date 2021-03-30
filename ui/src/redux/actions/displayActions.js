import Axios from "axios";
import { GET_DISPLAY } from "../constants/constants";
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