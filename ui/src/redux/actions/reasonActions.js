import Axios from "axios";
import { GET_REASONS } from "../constants/constants";
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