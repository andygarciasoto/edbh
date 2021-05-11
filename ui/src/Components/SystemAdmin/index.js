import React, { Component } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Import from "../../Views/Import";
import * as qs from "query-string";
import Administrator from "./systemAdmin";

class SystemAdmin extends Component {
  render() {
    const t = this.props.t;
    return (
      <div>
        <Tabs defaultActiveKey="siteAdmin" transition={false} id="system-tab">
          <Tab eventKey="siteAdmin" title={t('Site Administration')}>
            <Administrator
              t={t}
              user={this.props.user} />
          </Tab>
          <Tab eventKey="import" title={t('Excel Import/Export')}>
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
