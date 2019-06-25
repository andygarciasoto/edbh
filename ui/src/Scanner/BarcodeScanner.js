import React, { Component } from 'react'
import BarcodeReader from 'react-barcode-reader'
import { Form } from  'react-bootstrap';

class BarcodeScanner extends Component {
  constructor(props){
    super(props)
    this.state = {
      result: 'Scan your id on the barcode scanner to log in',
    }
    this.handleScan = this.handleScan.bind(this)
  }
  handleScan(data){
    this.setState({
      result: 'Scanning...',
    })
    console.log(data);
  }

  handleError(err){
    this.setState({result: 'Your id could not be read.'});
    console.error(err)
  }

  render(){
    return(
      <div>
        <BarcodeReader
          onError={this.handleError}
          onScan={this.handleScan}
          />
        <span style={{paddingRight: '15px', fontSize: '0.8em'}}>User Id:</span><Form.Control style={{paddingTop: '5px'}}type="password" disabled={true}></Form.Control>
        <p>{this.state.result}</p>
      </div>
    )
  }
}

export default BarcodeScanner;