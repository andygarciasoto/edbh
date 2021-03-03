import Axios from "axios";
import { GET_SHIFTS } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getShifts = (siteId) => {
  var url = `${API}/shifts?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_SHIFTS,
        shifts: response.data,
      });
      return response.data;
    });
  };
};
