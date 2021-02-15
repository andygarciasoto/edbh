
import React from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import {
    formatDateWithTime,
    formatDate,
    getResponseFromGeneric
} from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import FontAwesome from 'react-fontawesome';
import Spinner from '../Common/Spinner';
import LoadingModal from '../Common/LoadingModal';
import MessageModal from '../Common/MessageModal';
import BarcodeScannerModal from '../Common/BarcodeScannerModal';
import _ from 'lodash';
import '../../sass/Intershift.scss';
import IntershiftModal from '../Modal/IntershiftModal';
const axios = require('axios');
let interToken = null;

class Intershift extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            selectedAssetOption: props.selectedAssetOption,
            selectedDate: props.selectedDate,
            selectedShift: props.selectedShift,
            intershiftComments: [],
            lastComment: null,
            value: '',
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            messageModalType: '',
            messageModalMessage: '',
            modal_Intershift_Is_Open: false,
            modal_validate_IsOpen: false,
            modal_loadingspinner: false
        };
    }

    componentDidMount() {
        this.fetchData();
        try {
            this.props.socket.on('message', response => {
                if (response.message) {
                    this.fetchData();
                }
            });
        } catch (e) { console.log(e) }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.selectedAssetOption, prevState.selectedAssetOption) ||
            !_.isEqual(nextProps.selectedDate, prevState.selectedDate) ||
            !_.isEqual(nextProps.selectedShift, prevState.selectedShift)) {
            return {
                selectedAssetOption: nextProps.selectedAssetOption,
                selectedDate: nextProps.selectedDate,
                selectedShift: nextProps.selectedShift
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.selectedAssetOption, prevState.selectedAssetOption) ||
            !_.isEqual(this.state.selectedDate, prevState.selectedDate) ||
            !_.isEqual(this.state.selectedShift, prevState.selectedShift)) {
            this.setState({ modal_loadingspinner: true }, () => {
                this.fetchData();
            });
        }
    }

    fetchData() {
        const parameters = {
            mc: this.state.selectedAssetOption.asset_code,
            dt: formatDate(this.state.selectedDate).split("-").join(""),
            sf: _.find(this.props.user.shifts, { shift_name: this.state.selectedShift }).shift_id
        };

        if (interToken !== null) {
            interToken.cancel('Previous request canceled, new request is send');
        }
        interToken = axios.CancelToken.source();

        getResponseFromGeneric('get', API, '/intershift_communication', null, parameters, {}, interToken.token).then(response => {
            interToken = null;
            const intershiftComments = response || [];
            this.setState({
                intershiftComments,
                lastComment: intershiftComments.length > 0 ? _.sortBy(intershiftComments, 'entered_on').reverse()[0] : null,
                modal_loadingspinner: false
            });
        });
    }

    enterCommunication = (e) => {
        if (!_.isEmpty(this.state.value)) {
            const props = this.props;
            if (props.selectedAssetOption.is_multiple && props.user.role === 'Operator') {
                if (props.activeOperators.length > 1) {
                    this.setState({ modal_validate_IsOpen: true });
                } else {
                    this.submitIntershiftCommunication(props.activeOperators[0].badge);
                }
            } else {
                this.submitIntershiftCommunication(props.user.clock_number);
            }
        } else {
            this.setState({
                modal_loading_IsOpen: false,
                messageModalType: 'Error',
                messageModalMessage: 'Please type an intershift communication',
                modal_message_Is_Open: true
            });
        }
    }

    handleScan = (badge) => {
        this.setState({ modal_validate_IsOpen: false, modal_loading_IsOpen: true }, async () => {
            const parameters = {
                badge: badge,
                site_id: this.props.user.site
            };
            let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
            if (!res[0]) {
                this.setState({
                    modal_loading_IsOpen: false,
                    messageModalType: 'Error',
                    messageModalMessage: 'Error finding the user. Please try again',
                    modal_message_Is_Open: true
                });
            } else {
                this.setState({
                    modal_loading_IsOpen: false
                });
                this.submitIntershiftCommunication(badge);
            }
        });
    }

    submitIntershiftCommunication(badge) {
        this.setState({ modal_loading_IsOpen: true }, async () => {
            const data = {
                comment: this.state.value,
                clocknumber: badge,
                inter_shift_id: 0,
                asset_code: this.state.selectedAssetOption.asset_code
            }

            let res = await getResponseFromGeneric('put', API, '/intershift_communication', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_Is_Open: true, messageModalType: 'Error', messageModalMessage: 'Intershift communication was not inserted. Please try again' });
            } else {
                this.setState({ modal_loading_IsOpen: false, modal_message_Is_Open: true, messageModalType: 'Success', messageModalMessage: 'Intershift communication inserted successfully', value: '' });
                this.fetchData();
            }
        })
    }

    openIntershiftModal = () => {
        this.setState({
            modal_Intershift_Is_Open: true
        });
    }

    closeModal = () => {
        this.setState({
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            modal_Intershift_Is_Open: false,
            modal_validate_IsOpen: false
        })
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <div className={'intershift-communication-comments'}>
                    <h5>{t('Intershift Communication')}</h5>
                    {!this.state.modal_loadingspinner ?
                        < div id="intershift-table">
                            <Table striped bordered hover className="intershift-communication-table">
                                <thead>
                                    <tr>
                                        <th>{t('User')}</th>
                                        <th>{t('Comment')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!_.isEmpty(this.state.intershiftComments) ? <React.Fragment>
                                        <tr>
                                            <td style={{ width: '20%' }}>
                                                <span>{`${this.state.lastComment.first_name} ${this.state.lastComment.last_name}`}</span>
                                                <div className={'intershift-comment-date'}>{formatDateWithTime(this.state.lastComment.entered_on)}</div>
                                            </td>
                                            <td style={{ width: '80%' }} className={"intershift-comment"}>
                                                <div>{this.state.lastComment.comment}</div>
                                                {this.state.intershiftComments.length > 1 ?
                                                    <span className="intershift-read-more"
                                                        onClick={this.openIntershiftModal}>{`${t('Read More')}
                                        (${this.state.intershiftComments.length})`}
                                                        <FontAwesome name="angle-right" style={{ paddingLeft: 5 }} />
                                                    </span> : null
                                                }
                                            </td>
                                        </tr>
                                    </React.Fragment> :
                                        <tr><td colSpan={2}>{t('No intershift communications for this shift')}.</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                        : <Spinner />
                    }
                    <span className="dashboard-modal-field-group">
                        <p>{t('Enter new communication')}:</p>
                        <Form.Control style={{ paddingTop: '5px' }} type="text" value={this.state.value} disabled={!this.props.isEditable} onChange={(e) => this.setState({ value: e.target.value })}></Form.Control>
                    </span>
                    <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={!this.props.isEditable} onClick={this.enterCommunication}>{t('Submit')}</Button>
                    <IntershiftModal
                        isOpen={this.state.modal_Intershift_Is_Open}
                        onRequestClose={this.closeModal}
                        intershiftComments={this.state.intershiftComments}
                        t={t}
                    />
                    <LoadingModal
                        isOpen={this.state.modal_loading_IsOpen}
                        onRequestClose={this.closeModal}
                        t={t}
                    />
                    <MessageModal
                        isOpen={this.state.modal_message_Is_Open}
                        onRequestClose={this.closeModal}
                        type={this.state.messageModalType}
                        message={this.state.messageModalMessage}
                        t={t}
                    />
                    <BarcodeScannerModal
                        isOpen={this.state.modal_validate_IsOpen}
                        modalTitle={'Operator Scan'}
                        inputText={'Please scan badge to proceed'}
                        onRequestClose={this.closeModal}
                        t={t}
                        responseScan={this.handleScan}
                    />
                </div>
            </React.Fragment >
        )
    }
};

export default Intershift;


