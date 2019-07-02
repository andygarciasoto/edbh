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
        <span className="saving"><span>.</span><span>.</span><span>.</span></span>
    )
  }
}

export default BlinkDots;