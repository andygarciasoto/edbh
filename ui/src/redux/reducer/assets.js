import { GET_ASSETS } from '../constants/constants';

const initialState = {
	assets: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_ASSETS:
			return {
				...state,
				assets: { ...action.assets },
			};
		default:
			return state;
	}
};
