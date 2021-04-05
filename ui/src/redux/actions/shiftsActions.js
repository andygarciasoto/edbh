import Axios from "axios";
import { GET_SHIFTS, GET_SHIFT_INFO} from "../constants/constants";
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

export const getShiftInfo = (siteId, shift_id) => {
  var url = `${API}/shifts?site=${siteId}&shift_id=${shift_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_SHIFT_INFO,
        shift_info: response.data,
      });
      return response.data;
    });
  };
};
