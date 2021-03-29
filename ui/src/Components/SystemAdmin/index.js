import React, { Component } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Import from "../../Views/Import";
import { useTranslation } from "react-i18next";
import * as qs from "query-string";
import Administrator from "./systemAdmin";

const { t } = useTranslation();

class SystemAdmin extends Component {

  
  render() {
    return (
      <div>
        <Tabs defaultActiveKey="siteAdmin" transition={false} id="system-tab">
          <Tab eventKey="siteAdmin" title="Site Administration">
            <Administrator user={this.props.user} />
          </Tab>
          <Tab eventKey="import" title="Excel Import/Export">
            <Import
              t={t}
              history={this.props.history}
              user={this.props.user}
              search={qs.parse(this.props.history.location.search)}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default SystemAdmin;
