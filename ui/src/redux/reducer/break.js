import { GET_BREAK, GET_BREAK_BY_SITE, GET_SHIFTS } from '../constants/constants';

const initialState = {
	break: {},
	shifts: {}
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
		case GET_SHIFTS:
			return {
				...state,
				shifts: { ...action.shifts },
			};
		default:
			return state;
	}
};
