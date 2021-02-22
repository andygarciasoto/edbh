import Axios from "axios";
import { GET_DASHBOARD_INFO } from "../constants/constants";
import { API } from "../../Utils/Constants";

export const getDashboardInfo = (siteId) => {
  var url = `${API}/total_rows?site_id=${siteId}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_DASHBOARD_INFO,
        dashboardData: response.data[0],
      });
      return response.data[0]
    });
  };
};
