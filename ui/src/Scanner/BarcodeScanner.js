import React, { Component } from 'react'
import BarcodeReader from 'react-barcode-reader'
import { Form } from  'react-bootstrap';
import './BarcodeScanner.scss';
import BlinkDots from '../Layout/BlinkDots';
import ErrorModal from  '../Layout/ErrorModal';
import LoadingModal from  '../Layout/LoadingModal';

class BarcodeScanner extends Component {
  constructor(props){
    super(props)
    this.state = {
      result: 'Please scan a clock number barcode to begin',
      modal_error_IsOpen: false,
      modal_load_IsOpen: false
    }
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleWarning = this.handleWarning.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    const modalStyle = {
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
    };

    this.setState({modalStyle})
  }

  closeModal() {
    this.setState({modal_error_IsOpen: false, modal_load_IsOpen: false});
  }

  handleScan(data){
    this.setState({
      result: 'Scanning...',
    })
    console.log(data);
  }

  handleError(err){
    this.setState({modal_error_IsOpen: true});
    console.error(err)
  }

  handleWarning(err){
    this.setState({modal_load_IsOpen: true});
  }

  render(){
    return(
      <div id="barcodeScanner">
        <BarcodeReader
          onError={this.handleError}
          onScan={this.handleScan}
        />
        <Form.Control className={'signin-code-field'} type="password" disabled={true} hidden={true}></Form.Control>
        <p style={{display: 'inline'}} className="signin-result drop-shadow">{this.state.result}</p>&nbsp;<BlinkDots/>
        
        <ErrorModal
            isOpen={this.state.modal_error_IsOpen}
            //  onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={this.state.modalStyle}
            contentLabel="Example Modal"
          />

          <LoadingModal
            isOpen={this.state.modal_load_IsOpen}
            //  onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={this.state.modalStyle}
            contentLabel="Example Modal"
          />
      </div>
    )
  }
}

export default BarcodeScanner;