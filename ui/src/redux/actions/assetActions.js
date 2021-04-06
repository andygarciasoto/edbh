import Axios from 'axios';
import { GET_ASSETS } from '../constants/constants';
import { API } from '../../Utils/Constants';

export const getAssets = (siteId) => {
	var url = `${API}/machine?site=${siteId}&level=cell&automation_level=all`;
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
