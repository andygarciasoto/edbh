import { GET_BREAK } from '../constants/constants';

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
		default:
			return state;
	}
};
