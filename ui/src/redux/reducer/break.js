import { GET_BREAK, GET_BREAK_BY_SITE } from '../constants/constants';

const initialState = {
	break: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_BREAK:
			return {
				...state,
				break: { ...action.break },
			};

		case GET_BREAK_BY_SITE:
			return {
				...state,
				break: { ...action.break },
			};
		default:
			return state;
	}
};
