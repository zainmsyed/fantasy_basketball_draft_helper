import { UI } from '../../config/constants.js'

const percentFormatter = (cell) => {
  const value = cell.getValue()
  return value == null ? '' : `${(value * 100).toFixed(1)}%`
}

export function createTableConfig(data) {
  return {
    data,
    layout: 'fitColumns',
    // use virtual DOM to render only visible rows which improves performance for
    // larger datasets (faster filtering & scrolling)
    virtualDom: true,
    // set a fixed height to fully enable virtual DOM (prevents rendering all rows)
    height: UI.TABLE_HEIGHT,
    // speed up lookups and internal operations
    index: 'id',
    // no pagination: single scroll; virtual DOM still limits actual rows rendered
    columns: [
      { title: 'Name', field: 'name', headerFilter: false, hozAlign: 'left' },
      { title: 'Team', field: 'team', width: 80 },
      { title: 'Pos', field: '_pos_display', width: 90 },
      { title: 'GP', field: 'gp', sorter: 'number', width: 70 },
      { title: 'Expert Rank', field: 'expert_rank', sorter: 'number', width: 110 },
      { title: 'Algo Rank', field: 'algo_rank', sorter: 'number', width: 90 },
      { title: 'PTS', field: 'pts', sorter: 'number', width: 80 },
      { title: 'AST', field: 'ast', sorter: 'number', width: 80 },
      { title: 'REB', field: 'reb', sorter: 'number', width: 80 },
      { title: '3PM', field: 'threes', sorter: 'number', width: 80 },
      { title: 'FG%', field: 'fg_pct', sorter: 'number', width: 80, formatter: percentFormatter },
      { title: 'FT%', field: 'ft_pct', sorter: 'number', width: 80, formatter: percentFormatter },
      { title: 'STL', field: 'stl', sorter: 'number', width: 80 },
      { title: 'BLK', field: 'blk', sorter: 'number', width: 80 },
      { title: 'TO', field: 'to', sorter: 'number', width: 80 },
    ],
    initialSort: [{ column: 'name', dir: 'asc' }],
    placeholder: 'No players to display',
  }
}
