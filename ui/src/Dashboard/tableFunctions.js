export function handleTableCellClick(state, rowInfo, column, instance, ...rest) {
    if (typeof rowInfo !== "undefined") {
      if ((rowInfo && column.id === 'actual_pcs') && (rowInfo.row.actual_pcs !== null)) {
        return {
          style: {
            backgroundColor: (Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs)) ? '#b80600' : 'green',
            backgroundImage: (Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs)) ? 'url("../dark-circles.png")' : 
            'url("../arabesque.png")',
          }
        }
      }
      if ((rowInfo && column.id === 'cumulative_pcs') && (rowInfo.row.cumulative_pcs !== null)) {
          if (rowInfo.subRows !== undefined) {
            return {
              style: {
                backgroundColor: (Number(rowInfo.row.cumulative_pcs) <= Number(rowInfo.row.cumulative_target_pcs)) ? '#b80600' : 'green',
                backgroundImage: (Number(rowInfo.row.cumulative_pcs) <= Number(rowInfo.row.cumulative_target_pcs)) ? 'url("../dark-circles.png")' : 
                'url("../arabesque.png")',
              }
            }
          }
      }
      if (rowInfo && column.id === 'actions_comments') {
        if (rowInfo.subRows) {
          rowInfo.subRows.map((item, key) => {
            item.actions_comments = '';
            return void(0);
          })
        }
      }
      if (rowInfo && column.id === 'timelost') {
        if (rowInfo.subRows) {
          rowInfo.subRows.map((item, key) => {
            item.timelost = '';
            return void(0);
          })
        }
      }
      if (rowInfo && column.id === 'timelost_reason_code') {
        if (rowInfo.subRows) {
          rowInfo.subRows.map((item, key) => {
            item.timelost_reason_code = '';
            return void(0);
          })
        }
      }
      // this deletes the first repeated row in children section
      // rowInfo.subRows && rowInfo.subRows.length > 1 ? delete rowInfo.subRows[0]: void(0);
      // end of fix
      const needsExpander = rowInfo.subRows && rowInfo.subRows.length > 1 ? true : false;
      const expanderEnabled = !column.disableExpander;
      const expandedRows = Object.keys(this.state.expanded).filter(expandedIndex => {
          return this.state.expanded[expandedIndex] !== false;
      }).map(Number);
      const rowIsExpanded =
        expandedRows.includes(rowInfo.nestingPath[0]) && needsExpander
          ? true
          : false;
      const newExpanded = !needsExpander
        ? this.state.expanded
        : rowIsExpanded && expanderEnabled
        ? {
            ...this.state.expanded,
            [rowInfo.nestingPath[0]]: false
          }
        : {
            ...this.state.expanded,
            [rowInfo.nestingPath[0]]: {}
          };
      return {
        style:
          needsExpander && expanderEnabled
            ? { cursor: "pointer" }
            : { cursor: "auto" },
        onClick: (e, handleOriginal) => {
          this.setState({
            expanded: newExpanded
          });
        }
      };
    } else {
      return {
        onClick: (e, handleOriginal) => {
          if (handleOriginal) {
            handleOriginal();
          }
        }
      };
    }
  }
  