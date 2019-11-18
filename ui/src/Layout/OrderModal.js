import React from 'react';
import Modal from 'react-modal';
import BarcodeReader from 'react-barcode-reader';
import { Form } from 'react-bootstrap';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';
import { getRequest, getCurrentTime } from '../Utils/Requests';
import './CommentsModal.scss';
import OrderTwoModal from '../Layout/OrderTwoModal';


class OrderModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            errorMessage: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            order_data: ''
        }
        this.closeModal = this.closeModal.bind(this);
        this.handleScan = this.handleScan.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    submit = (e) => {
        const data = {
            params: {
                order_number: this.state.value,
                asset_code: this.props.parentData[0],
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime(this.props.timezone)
            }
        }
        this.setState({ modal_loading_IsOpen: true }, () => {
            const response = getRequest('/order_assembly', data)
            response.then((res) => {
                if (!res) {
                    this.setState({ modal_error_IsOpen: true, errorMessage: 'Please try again or try with a different order.' })
                } else {
                    this.setState({ modal_loading_IsOpen: false, modal_error_IsOpen: false, order_data: res[0].OrderData })
                    this.props.showValidateDataModal(res);
                }
                this.setState({ value: '' })
            })
        })
        this.setState({ newValue: '' })
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
    }

    handleScan(data) {
        let _this = this;
        this.setState({
            result: 'Scanning',
            value: data,
        }, () => { _this.submit(); })
    }

    handleError(err) {
        if (!isNaN(err)) {
            this.handleScan(err);
        } else {
            this.setState({ modal_error_IsOpen: true, errorMessage: 'Scan failed: Barcode not Valid' });
            console.log(err);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={this.props.style}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <BarcodeReader
                        onError={this.handleError}
                        onScan={this.handleScan}
                    />
                    <span className="dashboard-modal-field-group"><p>{this.props.label}:</p>
                        <Form.Control
                            style={{ paddingTop: '5px' }}
                            type={this.props.formType}
                            value={this.state.value}
                            min="0"
                            autoFocus
                            disabled={true}
                            maxLength={25}>
                        </Form.Control>
                    </span>
                </Modal>
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                <OrderTwoModal
                    isOpen={this.props.isOpenTwo}
                    open={this.props.open}
                    onRequestClose={this.props.onRequestClose}
                    contentLabel="Example Modal"
                    data={this.state.order_data}
                    t={this.props.t}
                    user={this.props.user}
                    Refresh={this.props.Refresh}
                    parentData={this.props.parentData}
                />
                <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                    message={this.state.errorMessage}
                />

            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default OrderModal;