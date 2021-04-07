import { GET_TAGS } from '../constants/constants';

const initialState = {
	tags: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_TAGS:
			return {
				...state,
				tags: { ...action.tags },
			};
		default:
			return state;
	}
};
