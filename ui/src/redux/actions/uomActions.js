import Axios from "axios";
import { GET_UOM } from "../constants/constants";
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