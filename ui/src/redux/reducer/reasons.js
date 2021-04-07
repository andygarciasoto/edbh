import { GET_REASONS, GET_REASONS_BY_SITE } from '../constants/constants';

const initialState = {
	reasons: {},
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
		default:
			return state;
	}
};
