import React, { Component } from 'react'
import BarcodeReader from 'react-barcode-reader'
import BlinkDots from '../Modal/BlinkDots';
import ErrorModal from '../Common/MessageModal';
import LoadingModal from '../Common/LoadingModal';
import { AUTH } from '../../Utils/Constants';

class BarcodeScanner extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: this.props.t('Please scan a clock number barcode to begin'),
      modal_error_IsOpen: false,
      errorMessage: '',
      modal_load_IsOpen: false,
      login: false
    }
  }

  componentDidMount() {
    const modalStyle = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
      overlay: {
        backgroundColor: 'rgba(0,0,0, 0.6)'
      }
    };

    this.setState({ modalStyle })
  }

  closeModal = () => {
    this.setState({
      modal_error_IsOpen: false,
      modal_load_IsOpen: false,
      result: this.props.t('Please scan a clock number barcode to begin')
    });
  }

  handleScan = (data) => {
    this.setState({
      result: 'Scanning',
      code: data,
    })
    this.authorize(this.state.code);
  }

  authorize(code) {
    window.location.replace(`${AUTH}/badge?badge=${code}&st=${this.props.st}`);
  }

  handleError = (err) => {
    this.setState({ modal_error_IsOpen: true });
    console.error(err)
  }

  handleLoad = (err) => {
    this.setState({ modal_load_IsOpen: true, login: true });
  }

  render() {
    return (
      <div id="barcodeScanner">
        <BarcodeReader
          onError={this.handleError}
          onScan={this.handleScan}
          minLength={2}
        />
        <p style={{ display: 'inline' }} className="signin-result drop-shadow">{this.state.result}</p>&nbsp;<BlinkDots />

        <ErrorModal
          isOpen={this.state.modal_error_IsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          shouldCloseOnOverlayClick={false}
          message={this.props.titleErr || 'Sign In attempt unsuccessful'}
          title={this.props.errMessage || 'Sign In Error'}
          t={this.props.t}
        />

        <LoadingModal
          isOpen={this.state.modal_load_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          login={this.state.login}
          t={this.props.t}
          shouldCloseOnOverlayClick={false}
        />
        {/* <button onClick={() => this.authorize('000282749')}>Log in</button> */}
      </div>
    )
  }
}

export default BarcodeScanner;