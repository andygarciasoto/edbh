import Axios from "axios";
import { GET_PARAMS, GET_TIMEZONES, GET_LANGUAGES} from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getParams = (siteId) => {
  var url = `${API}/commonparameters?site=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_PARAMS,
        params: response.data[0],
      });
      return response.data[0];
    });
  };
};

