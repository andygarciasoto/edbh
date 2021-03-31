import { GET_REASONS } from '../constants/constants';

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
		default:
			return state;
	}
};
