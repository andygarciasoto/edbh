import React from 'react';
import ReactTable from 'react-table';
import { Modal, Button } from 'react-bootstrap';
import {
    getResponseFromGeneric,
    formatDate,
    formatTime
} from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import _ from 'lodash';

class ActiveOperatorsModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeOperators: [],
            currentRow: null
        }
    }

    getColumns() {
        return [{
            Header: 'Name',
            accessor: 'name'
        }, {
            Header: 'Check-In Time',
            accessor: 'start_time',
            Cell: c => this.getCellTime(c.original, 'start_time', ''),
        }, {
            Header: 'Check-Out Time',
            accessor: 'end_time',
            Cell: c => this.getCellTime(c.original, 'end_time', ''),
        }, {
            Header: 'Action',
            accessor: 'reason'
        }, {
            Header: 'Expected Return',
            accessor: 'possible_end_time',
            Cell: c => this.getCellTime(c.original, 'possible_end_time', ''),
        }]
    }

    getCellTime(row, prop, defaultValue) {
        if (row) {
            let valueToDisplay = row[prop] ? row[prop] : defaultValue;
            return valueToDisplay || valueToDisplay === 0 ?
                <span className={'wordwrap'} data-tip={valueToDisplay}>{formatTime(valueToDisplay)}</span> :
                <span style={{ paddingRight: '90%' }} className={'empty-field'}></span>;
        } else {
            return <span style={{ paddingRight: '90%' }} className={'empty-field'}></span>;
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen && !_.isEmpty(nextProps.activeOperators) && !_.isEqual(nextProps.activeOperators, prevState.activeOperators)) {
            return {
                activeOperators: nextProps.activeOperators
            };
        } else if (nextProps.isOpen && !_.isEmpty(nextProps.currentRow) && !_.isEqual(nextProps.currentRow, prevState.currentRow)) {
            return {
                currentRow: nextProps.currentRow
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.isOpen && !_.isEmpty(this.state.currentRow) && !_.isEqual(this.state.currentRow, prevState.currentRow)) {
            this.fetchData(this.props);
        }
    }

    fetchData(props) {

        const parameters = {
            asset_id: props.selectedAssetOption.asset_id,
            start_time: formatDate(this.state.currentRow.started_on_chunck),
            end_time: formatDate(this.state.currentRow.ended_on_chunck)
        };

        getResponseFromGeneric('get', API, '/get_scan', {}, parameters, {}).then(response => {
            let activeOperators = response || [];
            activeOperators = _.filter(activeOperators, (item) => { return item.reason !== 'Check-Out' });
            this.setState({
                activeOperators
            });
        });
    }

    render() {
        const columns = this.getColumns();
        const props = this.props;
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    size="lg"
                    aria-labelledby="example-modal-sizes-title-lg"
                    centered
                    show={props.isOpen}
                    onHide={props.onRequestClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Active Operators')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ReactTable
                            data={this.state.activeOperators}
                            columns={columns}
                            sortable={false}
                            pageSize={5}
                            showPaginationBottom={false}
                            headerStyle={{ fontSize: '0.5em' }}
                            headerClassName={"wordwrap"}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={props.onRequestClose} variant="outline-danger">{t('Close')}</Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
}

export default ActiveOperatorsModal;