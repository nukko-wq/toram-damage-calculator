# Code Style & Conventions

## Formatting (Biome Configuration)
- **Indentation**: Tabs (configured in biome.json)
- **Quotes**: Single quotes for JavaScript, double quotes for JSX
- **Semicolons**: As needed (auto-formatting)
- **Imports**: Auto-organized by Biome

## TypeScript Conventions
- **Strict mode enabled** in tsconfig.json
- **Type definitions**: Centralized in `src/types/`
- **No inferrable types**: Explicit typing required where types can't be inferred
- **Interface naming**: PascalCase (e.g., `CalculatorData`, `BuffSkillFormData`)
- **Enum initialization**: All enum values must be explicitly initialized

## Component Structure
- **Functional components** with TypeScript
- **React Hook Form + Zod** pattern for form validation
- **Custom hooks** for complex state management integration
- **Self-closing elements** enforced for empty JSX elements

## File Organization
- `src/types/`: Central type definitions
- `src/schemas/`: Zod validation schemas
- `src/stores/`: Zustand store definitions
- `src/utils/`: Utility functions and business logic
- `src/components/`: React components
- `src/data/`: Preset game data

## Naming Conventions
- **Files**: camelCase (e.g., `calculatorStore.ts`, `basicStatsCalculation.ts`)
- **Components**: PascalCase
- **Variables/Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Linting Rules (Biome)
- **No unused imports/variables**: Warnings
- **Parameter assignment**: Error
- **Default parameters last**: Error
- **Single variable declarations**: Error
- **Number namespace usage**: Required for numeric operations
- **Self-closing elements**: Enforced