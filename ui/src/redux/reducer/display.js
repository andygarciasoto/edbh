import { GET_DISPLAY } from '../constants/constants';

const initialState = {
	display: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_DISPLAY:
			return {
				...state,
				display: { ...action.display },
			};
		default:
			return state;
	}
};
