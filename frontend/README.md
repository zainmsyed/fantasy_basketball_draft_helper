# Basketball Draft Helper - Frontend

A modern web application for fantasy basketball draft preparation, built with Vite, Alpine.js, and Tabulator.

## Features

- Upload CSV files with player rankings from your fantasy platform
- Automatic column mapping with smart detection
- Fuzzy name matching to historical NBA stats
- Data validation and quality reporting
- Integrated player rankings table with filtering
- Local storage persistence

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## CSV Upload Instructions

1. **Prepare your CSV**: Export player rankings from your fantasy platform (Fantrax, ESPN, Yahoo, etc.)
   - Required columns: Player Name, Team, Position
   - Recommended: Expert Rank, Points, Assists, Rebounds, etc.
   - File size limit: 5MB
   - Max players: 500 (recommended 200-250 for performance)

2. **Upload the file**:
   - Click "Upload CSV" button
   - Select your CSV file
   - The app will auto-detect columns and show a preview

3. **Map columns** (if needed):
   - Use dropdowns to map your CSV columns to required fields
   - The app attempts auto-detection based on common column names

4. **Match players**:
   - Click "Match Players" to find historical NBA stats
   - Review match results and apply manual overrides if needed

5. **Save integrated list**:
   - Click "Save Integrated List" to persist the merged data
   - The table will switch to show your integrated rankings

## Supported CSV Formats

- **Delimiter**: Comma (`,`)
- **Encoding**: UTF-8 (with Windows-1252 fallback)
- **Headers**: Required (first row)
- **Columns**: Flexible, auto-detected

### Example CSV Structure

```csv
Player Name,Team,Position,Expert Rank,Points,Assists,Rebounds
LeBron James,LAL,SF,1,27.5,8.5,10.2
Stephen Curry,GSW,PG,2,28.1,6.2,5.3
```

## Development

### Project Structure

```
frontend/
├── src/
│   ├── main.js              # App entry point
│   ├── modules/
│   │   ├── data/            # Data processing modules
│   │   ├── ui/              # UI components
│   │   └── table/           # Table configuration
│   ├── utils/               # Shared utilities
│   └── types/               # TypeScript definitions
├── tests/                   # Unit and integration tests
└── public/data/             # Sample data files
```

### Key Modules

- **csv-parser.js**: PapaParse wrapper for CSV processing
- **name-matcher.js**: Fuzzy matching with Fuse.js
- **data-validator.js**: Validation rules and reporting
- **alpine-store.js**: Main app state management

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/name-matcher.test.js
```

### Building

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Run `npm run lint` before committing
