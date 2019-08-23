import React from  'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import { Button } from 'react-bootstrap'
import * as _ from 'lodash';
import ConfirmModal from  '../Layout/ConfirmModal';
import LoadingModal from  '../Layout/LoadingModal';
import ErrorModal from  '../Layout/ErrorModal';
import { sendPut, getCurrentTime, formatDateWithTime } from '../Utils/Requests';


class SignoffModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            signoffMessage: this.props.t(this.props.message) || this.props.t('By clicking \'Accept\' you confirm that all the values for this hour are correct.'),
            headerMessage: '',
            style: {
                content : {
                    top                   : '50%',
                    left                  : '50%',
                    right                 : 'auto',
                    bottom                : 'auto',
                    marginRight           : '-50%',
                    transform             : 'translate(-50%, -50%)',
                  },
                  overlay : {
                    backgroundColor: 'rgba(0,0,0, 0.6)'
                }
            }
        } 
        this.signOff = this.signOff.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    signOff() {
        let rowData = {}
        if (this.props.currentRow) {
            rowData = this.props.currentRow
        }
        const data = {
            dhx_data_id: rowData.dxhdata_id,
            clocknumber : this.props.user.clock_number ? this.props.user.clock_number : null,
            first_name : this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name : this.props.user.clock_number ? undefined : this.props.user.last_name,
            asset_code: this.props.parentData[0],
            row_timestamp: formatDateWithTime(rowData.hour_interval_start),
            timestamp: getCurrentTime(),
        }
        this.setState({modal_loading_IsOpen: true}, () => {
            const response = sendPut({
                ...data
            }, `/${this.state.signOffRole}_sign_off`)
            response.then((res) => {
                if (res !== 200 || !res) {
                    this.setState({modal_loading_IsOpen: false, modal_error_IsOpen: true})
                } else {
                    this.setState({request_status: res, modal_loading_IsOpen: false, modal_confirm_IsOpen: true})
                }
                this.props.Refresh(this.props.parentData);
                this.props.onRequestClose();
            })
          })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            signOffRole: nextProps.signOffRole,
            headerMessage: `${nextProps.signOffRole} ${nextProps.t('Sign Off')} (Logged in as ${nextProps.user.role})`
        })
    } 

    render() {
        const styles = _.cloneDeep(this.props.style || this.state.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
        }
        return (
            <React.Fragment>
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div className={"wrap-signoff"}>
                    <p style={{fontWeight: 'bold'}} className="dashboard-modal-signoff-header">{this.state.headerMessage}</p>
                    <p style={{textAlign: 'center'}}>{this.state.signoffMessage}</p>
                    <Button variant="outline-success" style={{marginTop: '20px', textAlign: 'center'}} className="error-button signoff-buttons" onClick={this.signOff}>{this.props.t('Accept')}</Button>
                    <Button variant="outline-default" style={{marginTop: '20px', textAlign: 'center'}} className="error-button signoff-buttons" onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                </div>
            </Modal>
            <ConfirmModal
                isOpen={this.state.modal_confirm_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                shouldCloseOnOverlayClick={false}
                message={'Signoff was successful.'}
                title={'Request Successful'}
            />
            <LoadingModal
                isOpen={this.state.modal_loading_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                t={this.props.t}
            />
            <ErrorModal
                isOpen={this.state.modal_loading_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                t={this.props.t}
            />
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default SignoffModal;