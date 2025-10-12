<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0
Modified principles: N/A
Added sections: VI. Incremental Development principle
Removed sections: N/A
Templates requiring updates: ✅ plan-template.md, spec-template.md, tasks-template.md updated
Follow-up TODOs: None
-->

# Basketball Draft Helper Constitution

## Core Principles

### I. Modular Architecture
Every feature MUST be implemented as an independent, self-contained module with clear boundaries and minimal coupling. Modules MUST have single responsibilities, well-defined interfaces, and be independently testable. Shared functionality MUST be extracted into reusable utilities rather than duplicated across modules.

**Rationale**: Modular architecture ensures maintainability, testability, and enables independent development of features like CSV processing, ranking algorithms, and draft tracking.

### II. Minimal Dependencies (NON-NEGOTIABLE)
Dependencies MUST be justified and minimized. Each dependency MUST provide significant value that cannot be reasonably implemented in-house. No duplicate functionality across dependencies. Dependencies MUST be actively maintained, well-documented, and have clear upgrade paths.

**Rationale**: Minimal dependencies reduce bundle size, security vulnerabilities, and maintenance overhead while ensuring the application remains lightweight and fast-loading.

### III. Pure Functions First
Business logic MUST be implemented as pure functions whenever possible. Side effects MUST be isolated to dedicated service layers. Functions MUST have predictable inputs/outputs, be easily testable, and free of hidden dependencies.

**Rationale**: Pure functions ensure predictable behavior for critical calculations like Z-score rankings and enable reliable testing of complex draft algorithms.

### IV. Performance-First Design
All user interactions MUST respond within 100ms. CSV processing MUST complete within 3 seconds for 200 players. Bundle size MUST remain under 1MB. Memory usage MUST be optimized for large datasets. Performance regressions MUST be caught before deployment.

**Rationale**: Fantasy draft tools are used in time-sensitive situations where performance directly impacts user experience and decision-making quality.

### V. Client-Side Data Sovereignty
All data processing MUST occur client-side. No external API dependencies for core functionality during drafts. User data MUST remain in browser local storage. Offline functionality MUST be preserved for critical features.

**Rationale**: Draft situations require reliability and privacy. Users must maintain full control over their data without external service dependencies.

### VI. Incremental Development (NON-NEGOTIABLE)
Features MUST be broken into small, independently deliverable increments. Each increment MUST provide user value within 1-2 days of development. Features MUST be designed for progressive enhancement, allowing early deployment of basic functionality. No feature development cycles longer than one week.

**Rationale**: Small, digestible features enable rapid feedback, reduce risk, allow early validation of user needs, and maintain development momentum through frequent wins.

## Development Standards

### Code Quality Requirements
- **TypeScript First**: All new code MUST use TypeScript for type safety and documentation
- **Consistent Naming**: Use clear, descriptive names following established patterns (camelCase for variables/functions, PascalCase for components)
- **Single Responsibility**: Each function/class MUST have one clear purpose
- **Documentation**: All public interfaces MUST have JSDoc comments
- **Error Handling**: All async operations MUST include proper error handling and user feedback

### Testing Requirements
- **Algorithm Testing**: Z-score calculations, punt strategies, and ranking algorithms MUST have comprehensive unit tests
- **Integration Testing**: CSV upload, data merging, and draft tracking workflows MUST have integration tests
- **Performance Testing**: Large dataset processing MUST be benchmarked and monitored
- **Cross-Browser Testing**: Core functionality MUST work across Chrome, Firefox, Safari, and Edge

### File Organization Standards
```
src/
├── modules/           # Feature modules (csv-processor, ranking-engine, draft-tracker)
├── utils/            # Shared utilities (calculations, validators, formatters)
├── types/            # TypeScript type definitions
├── data/             # Static data files (last_year_stats.json)
└── services/         # Side-effect services (storage, export)
```

## Technology Constraints

### Approved Technology Stack
- **Build Tool**: Vite (fast builds, excellent development experience)
- **Framework**: Alpine.js (lightweight reactivity, minimal learning curve)
- **Styling**: Tailwind CSS + DaisyUI (utility-first, component library)
- **Data Table**: Tabulator (feature-complete table functionality)
- **Storage**: LocalForage (enhanced localStorage with fallbacks)
- **CSV Processing**: PapaParse (reliable, well-tested CSV parser)
- **Utilities**: Lodash (battle-tested utility functions)

### Technology Restrictions
- **No Heavy Frameworks**: React, Vue, Angular are prohibited for this project's scope
- **No Backend Dependencies**: Express, databases, or server-side processing are prohibited
- **No External APIs**: Live data fetching during drafts is prohibited
- **No Large Libraries**: Libraries >100KB must be justified and approved

## Governance

### Amendment Process
Constitution changes MUST follow semantic versioning: MAJOR for breaking principle changes, MINOR for new principles, PATCH for clarifications. All amendments MUST include impact analysis, migration plan, and template updates. Changes affecting development workflow MUST be approved before implementation.

### Compliance Verification
All pull requests MUST verify compliance with these principles. Architecture decisions MUST be documented with principle alignment justification. Performance regressions MUST be blocked from merging. Code reviews MUST enforce modular design and minimal dependencies.

### Exception Handling
Exceptions to these principles MUST be documented with specific justification, time-bound approval, and remediation plan. Emergency fixes MAY bypass non-critical principles but MUST include follow-up tasks for compliance restoration.

**Version**: 1.1.0 | **Ratified**: 2025-10-12 | **Last Amended**: 2025-10-12