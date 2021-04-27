import React from 'react';
import { Card, Col } from 'react-bootstrap';
import '../../sass/SystemAdmin.scss';

const CardComponent = ({ className, icon, number, name, onClick, t }) => (
  <Col sm={2} className='cardContainer'>
    <Card onClick={onClick} className='modulesCards'>
      <Card.Body>
        <Card.Img variant='top' src={icon} alt={`${icon}-icon`} className='icon' />
        <Card.Title>{number}</Card.Title>
        <Card.Title>{t(name)}</Card.Title>
      </Card.Body>
    </Card>
  </Col>
);

export default CardComponent;
