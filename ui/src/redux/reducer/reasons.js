import { GET_REASONS, GET_REASONS_BY_SITE, GET_ASSETS } from '../constants/constants';

const initialState = {
	reasons: {},
	assets: {}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_REASONS:
			return {
				...state,
				reasons: { ...action.reasons },
			};
		case GET_REASONS_BY_SITE:
			return {
				...state,
				reasons: { ...action.reasons },
			};
		case GET_ASSETS:
			return {
				...state,
				assets: { ...action.assets },
			};
		default:
			return state;
	}
};
