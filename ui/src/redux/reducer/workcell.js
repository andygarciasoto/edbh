import { GET_WORKCELLS } from '../constants/constants';

const initialState = {
	workcells: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case GET_WORKCELLS:
			return {
				...state,
				workcells: { ...action.workcells },
			};
		default:
			return state;
	}
};
