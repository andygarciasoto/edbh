import { GET_UOM } from '../constants/constants';

const initialState = {
	uom: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_UOM:
			return {
				...state,
				uom: { ...action.uom },
			};
		default:
			return state;
	}
};
