import Axios from "axios";
import { GET_BREAK } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getBreak = (siteId) => {
  var url = `${API}/unique_unavailable?site_id=${siteId}`;
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