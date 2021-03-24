import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import reasonHelper from './ReasonHelper';


class ReasonTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    }

    getInitialState(props) {
        return {
            dxhdataList: props.dxhdataList,
            type: props.type,
            productionRow: props.productionRow,
            editReason: false,
            currentReason: {},
            newReason: {},
            base: props.base,
            setupReasonsOptions: props.setupReasonsOptions,
            productionReasonsOptions: props.productionReasonsOptions,
            allReasonOptions: props.allReasonOptions,
            levelOptions: props.levelOptions,
            responsibleOptions: props.responsibleOptions,
            levelOption: null
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.dxhdataList, prevState.dxhdataList)) {
            return {
                dxhdataList: nextProps.dxhdataList,
                productionRow: nextProps.productionRow,
                base: nextProps.base,
                setupReasonsOptions: nextProps.setupReasonsOptions,
                productionReasonsOptions: nextProps.productionReasonsOptions,
                allReasonOptions: nextProps.allReasonOptions,
                levelOptions: nextProps.levelOptions,
                responsibleOptions: nextProps.responsibleOptions,
                editReason: false,
                currentReason: {},
                newReason: {}
            };
        }
        else return null;
    }

    render() {
        const t = this.props.t;
        return (
            <ReactTable
                className={'reactTableTReason'}
                data={this.state.dxhdataList}
                columns={this.getHeaders()}
                defaultPageSize={this.state.dxhdataList.length > 3 ? this.state.dxhdataList.length : 4}
                showPaginationBottom={false}
                noDataText={t('No ' + this.state.type + ' entries yet')}
            />
        )
    }

}

Object.assign(ReasonTable.prototype, reasonHelper);

export default ReasonTable;