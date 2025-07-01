# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a **Toram Online Damage Calculator** - a web application for calculating damage in the MMORPG "Toram Online". It's built for the Japanese gaming community with a Japanese interface.

## Technology Stack
- **Framework**: Next.js 15 with App Router + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Form Management**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Code Quality**: Biome (formatting & linting)

## Development Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm start           # Start production server
npm run lint        # Run Biome linter
npm run lint:fix     # Fix linting issues automatically
npm run format      # Format code with Biome
npx tsc --noEmit     # Type check without emitting files
```

## Architecture Overview

### Core Form System
The application consists of interconnected forms that feed into a damage calculation engine:
- `BaseStatsForm`: Character stats (STR, INT, VIT, etc. 1-510 range)
- `WeaponForm`: Main/sub weapon configuration with ATK, stability, refinement
- `CrystalForm`: Multi-slot crystal system (weapon/armor/additional/special)
- `EquipmentForm`: 8-slot equipment system with complex property management
- `BuffSkillForm`: 58 buff skills across 19 skill categories with weapon-type filtering
- `FoodForm`: 5-slot food buff system with effect levels
- `BuffItemForm`: 12 categories of buff items with modal selection
- `RegisterForm`: Register effects and guild food bonuses
- `EnemyForm`: Target/enemy configuration

### State Management Architecture (Zustand)
- **3-Store Pattern**: `calculatorStore` (core data), `saveDataStore` (persistence), `uiStore` (UI state)
- **Custom Hooks**: `useCalculatorData`, `useSaveDataManager` provide simplified component interfaces
- **Real-time Updates**: React Hook Form `watch()` → Zustand store updates → calculation triggers
- **Memory Management**: Automatic cleanup of temporary equipment edits and session data

### Simplified Data System
- **Two-Tier Architecture**: Preset TypeScript → User Custom (LocalStorage)
- **Preset Data**: TypeScript files (`src/data/crystals.ts`, `equipments.ts`, `enemies.ts`, `buffItems.ts`, `buffSkills.ts`)
- **User Custom Data**: LocalStorage with CRUD operations, timestamps, and export/import
- **Data Access Layer**: Unified APIs in `*Database.ts` files merge all data sources
- **Type Safety**: Full TypeScript integration with compile-time validation

### Equipment System Complexity
Equipment supports 70+ properties including:
- Basic stats (ATK, DEF, HP, MP) with both flat and percentage modifiers
- Game-specific mechanics (penetration, critical rates, elemental resistances)
- Refinement system (0-15 levels) with automatic stat scaling
- 8 equipment slots: Main, Body, Additional, Special, Sub weapon, Fashion 1-3
- **Multi-State Management**: Persistent → Temporary → Edit Session → Runtime states
- **Custom Equipment Creation**: Full CRUD with property editor and validation

### Crystal System Architecture
- 4 crystal categories with 2 slots each (8 total slots)
- Normal crystals: Universal compatibility across all slots
- Typed crystals: Category-specific with unique properties
- Modal-based selection system with filtering and search
- Hybrid data support: Preset crystals + user custom crystals

### Calculation System Status
- **Phase 1 (Complete)**: HP/MP calculations with exact Toram formulas implemented
- **Phase 2 (Partial)**: Equipment/crystal bonus integration structure designed
- **Phase 3 (Planned)**: Full damage calculation engine implementation
- **Current**: StatusPreview shows real-time HP/MP; DamagePreview uses placeholder data
- **Data Flow**: Forms → Zustand Store → Manual calculation calls (will be automatic in Phase 3)

## Code Conventions
- **Indentation**: Tabs (configured in Biome)
- **Quotes**: Single quotes for JS, double quotes for JSX
- **Semicolons**: As needed (Biome auto-formatting)
- **Imports**: Auto-organized by Biome
- **Component Structure**: Functional components with TypeScript
- **Form Validation**: Zod schemas in `src/schemas/`
- **Type Definitions**: Centralized in `src/types/`

## Development Phase Status
- **Phase 1 (Complete)**: Input forms and UI components, HP/MP calculations
- **Phase 2 (Complete)**: User custom equipment/crystal editing, buff systems
- **Phase 3 (Planned)**: Full damage calculation engine, real-time calculation updates

## Key Files and Structure
- `src/types/calculator.ts`: Central type definitions for all game data
- `src/data/*.ts`: Preset game data (crystals, equipment, buffItems, enemies, buffSkills)
- `src/utils/*Database.ts`: Data access layer merging preset and user data
- `src/schemas/`: Zod validation schemas for all forms
- `src/stores/`: Zustand stores (calculator, saveData, ui)
- `src/utils/basicStatsCalculation.ts`: HP/MP calculation implementation
- `src/utils/calculationEngine.ts`: Main calculation engine (partial implementation)

## Documentation Structure
Comprehensive Japanese documentation in `docs/` organized by:
- `requirements/` (00-10): Numbered system requirements and specifications
- `technical/`: Implementation details and architecture
- `ui/`: Interface design and component specifications
- `database/`: Data structures and management patterns
- `calculations/`: Game formula implementations
- `store/`: State management architecture

## Important Development Notes

### Equipment Property System
Equipment uses a complex 70+ property system with both flat and percentage modifiers. When working with equipment:
- Properties are defined in `src/types/calculator.ts`
- Use the property editor component for creating/editing
- All properties support both positive and negative values
- Refinement automatically scales certain properties

### Buff System Integration
Multiple buff systems work together:
- **Buff Skills**: 58 skills with weapon-type filtering (auto-show/hide mastery skills)
- **Food Buffs**: 5-slot system with effect levels 1-10
- **Buff Items**: Modal selection with category-based organization
- **Register Effects**: Special bonuses with level ranges

### Data Persistence Patterns
- **Calculator Data**: Auto-saved to current save slot on changes
- **Custom Equipment/Crystals**: Shared across all save slots
- **UI State**: Persisted for user preferences
- **Temporary Data**: Automatically cleaned up on save/load operations

### Working with this Codebase

#### When implementing calculations:
- Use exact Toram Online formulas from `docs/calculations/basic-stats.md`
- Follow the INT() function pattern for floor operations
- Reference existing HP/MP implementations in `src/utils/basicStatsCalculation.ts`

#### When working with state management:
- Use the established 3-store pattern (calculator, saveData, ui)
- Follow the custom hooks pattern for component integration
- Ensure proper cleanup of temporary states

#### When adding new forms or components:
- Follow the React Hook Form + Zod validation pattern
- Use the established modal system for selection interfaces
- Integrate with Zustand stores via the established update patterns

#### When working with equipment/crystal systems:
- Understand the multi-state system (persistent, temporary, edit session)
- Use the `*Database.ts` utilities for data access
- Follow the property system patterns for complex data structures

### Testing
No testing framework is currently configured. Use manual testing via the development server with real game data validation.