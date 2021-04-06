import Axios from "axios";
import { GET_WORKCELLS } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getWorkcells = (siteId) => {
  var url = `${API}/workcell?site_id=${siteId}`;
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