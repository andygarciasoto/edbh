import Axios from 'axios';
import { GET_TAGS } from '../constants/constants';
import { API } from '../../Utils/Constants';
import { genericRequest } from '../../Utils/Requests';

export const getTags = (siteId) => {
	var url = `${API}/tags?site_id=${siteId}`;
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

export const getTagsFilter = (params) => {
	return (dispatch) => {
	  return genericRequest('get', API, '/tags', null, params).then((response) => {
		dispatch({
		  type: GET_TAGS,
		  tags: response.data,
		});
		return response.data;
	  });
	};
  };