import React, { Component } from 'react'
import './BlinkDots.scss';

class BlinkDots extends Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }

  render(){
    return(
        <span className="saving drop-shadow"><span>.</span><span>.</span><span>.</span></span>
    )
  }
}

export default BlinkDots;