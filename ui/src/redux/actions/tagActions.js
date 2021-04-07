import Axios from 'axios';
import { GET_TAGS } from '../constants/constants';
import { API } from '../../Utils/Constants';

export const getTags = (siteId) => {
	var url = `${API}/tags?site=${siteId}`;
	return (dispatch) => {
		return Axios.get(url).then((response) => {
			dispatch({
				type: GET_TAGS,
				tags: response.data,
			});
			return response.data;
		});
	};
};
