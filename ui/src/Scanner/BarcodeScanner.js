import React, { Component } from 'react'
import BarcodeReader from 'react-barcode-reader'
import './BarcodeScanner.scss';
import BlinkDots from '../Layout/BlinkDots';
import ErrorModal from  '../Layout/ErrorModal';
import LoadingModal from  '../Layout/LoadingModal';
import { getRequestAuth } from '../Utils/Requests';
import { AUTH } from '../Utils/Constants';

class   BarcodeScanner extends Component {
  constructor(props){
    super(props)
    this.state = {
      result: this.props.t('Please scan a clock number barcode to begin'),
      modal_error_IsOpen: false,
      errorMessage: '',
      modal_load_IsOpen: false,
      login: false
    }
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
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
    this.setState({
      modal_error_IsOpen: false, 
      modal_load_IsOpen: false, 
      result: this.props.t('Please scan a clock number barcode to begin')
    });
  }

  handleScan(data){
    this.setState({
      result: 'Scanning',
      code: data,
    })
    this.authorize(this.state.code); 
  }

  authorize(code) {
      window.location.replace(`${AUTH}/badge?badge=${code}`);
  }

  handleError(err) {
    this.setState({modal_error_IsOpen: true});
    console.error(err)
  }

  handleLoad(err){
    this.setState({modal_load_IsOpen: true, login: true});
  }

  render(){
    return(
      <div id="barcodeScanner">
        <BarcodeReader
          onError={this.handleError}
          onScan={this.handleScan}
          minLength={4}
        />
        {/* <Form.Control className={'signin-code-field'} type="password" disabled={true} hidden={false}></Form.Control> */}
        <p style={{display: 'inline'}} className="signin-result drop-shadow">{this.state.result}</p>&nbsp;<BlinkDots/>
        
        <ErrorModal
            isOpen={this.state.modal_error_IsOpen}
            //  onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            contentLabel="Example Modal"
            shouldCloseOnOverlayClick={false}
            message={'Sign In attempt unsuccessful'}
            title={'Sign In Error'}
          />

          <LoadingModal
            isOpen={this.state.modal_load_IsOpen}
            //  onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={this.state.modalStyle}
            contentLabel="Example Modal"
            login={this.state.login}
            t={this.props.t}
            shouldCloseOnOverlayClick={false}
          />
          {/* <p onClick={this.handleLoad} style={{cursor: 'pointer'}}>error</p> */}
      </div>
    )
  }
}

export default BarcodeScanner;