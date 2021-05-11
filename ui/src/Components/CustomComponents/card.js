import React from "react";
import "../../sass/SystemAdmin.scss";

const CardComponent = ({ className, icon, number, name, onClick, t }) => (
  <div className={className} onClick={onClick}>
    <img src={icon} alt={`${icon}-icon`} className="icon" />
    <p className="p-number">{number}</p>
    <p className="p-name">{t(name)}</p>
  </div>
);

export default CardComponent;
