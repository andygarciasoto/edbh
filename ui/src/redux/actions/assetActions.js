import Axios from 'axios';
import { GET_ASSETS, GET_DISPLAY } from '../constants/constants';
import { API } from '../../Utils/Constants';

export const getAssets = (siteId) => {
	var url = `${API}/asset_by_site?site=${siteId}`;
	return (dispatch) => {
		return Axios.get(url).then((response) => {
			dispatch({
				type: GET_ASSETS,
				assets: response.data,
			});
			return response.data;
		});
	};
};

export const getDisplayById = (siteId, display_id) => {
  var url = `${API}/display_by_site?site_id=${siteId}&assetdisplaysystem_id=${display_id}`;
  return (dispatch) => {
    return Axios.get(url).then((response) => {
      dispatch({
        type: GET_DISPLAY,
        display: response.data[0],
      });
      return response.data[0];
    });
  };
};
