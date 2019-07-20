import { Row } from "react-bootstrap";

export function handleTableCellClick(state, rowInfo, column, instance, ...rest) {
    if (typeof rowInfo !== "undefined") {
      if (rowInfo && column.id === 'actual_pcs') {
        return {
          style: {
            backgroundColor: Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs) ? '#b80600' : 'green',
            backgroundImage: Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs) ? 'url("https://www.transparenttextures.com/patterns/dark-circles.png")' : 'url("https://www.transparenttextures.com/patterns/arabesque.png"',
          }
        }
      }
      // this deletes the first repeated row in children section
      rowInfo.subRows && rowInfo.subRows.length > 1 ? delete rowInfo.subRows[0]: void(0);
      // end of fix
      // console.log(rowInfo)
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
  