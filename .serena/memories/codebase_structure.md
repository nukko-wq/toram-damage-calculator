# Codebase Structure

## Root Directory
```
├── src/                    # Source code
├── docs/                   # Comprehensive documentation
├── public/                 # Static assets
├── .vscode/               # VS Code configuration
├── package.json           # Dependencies and scripts
├── biome.json            # Code quality configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── CLAUDE.md             # AI assistant instructions
└── README.md             # Project documentation
```

## Source Structure (`src/`)
```
├── app/                   # Next.js App Router pages and layouts
├── components/            # React components
├── data/                  # Preset game data (crystals, equipment, etc.)
├── hooks/                 # Custom React hooks
├── schemas/               # Zod validation schemas
├── stores/                # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Business logic and utilities
```

## Key Directories

### `src/types/`
Central type definitions for the entire application:
- `calculator.ts` - Main game data types
- `stores.ts` - Store interface definitions
- `buffSkill.ts` - Buff skill system types

### `src/stores/`
Zustand stores (3-store pattern):
- `calculatorStore.ts` - Core calculation data
- `saveDataStore.ts` - Data persistence
- `uiStore.ts` - UI state management

### `src/utils/`
Business logic and utilities:
- `calculationEngine.ts` - Main calculation engine
- `basicStatsCalculation.ts` - HP/MP calculations
- `*Database.ts` - Data access layer files
- `*Manager.ts` - Feature management utilities

### `docs/`
Comprehensive documentation organized by topic:
- `requirements/` - System specifications (numbered 00-10)
- `technical/` - Implementation details
- `calculations/` - Game formula implementations
- `store/` - State management architecture