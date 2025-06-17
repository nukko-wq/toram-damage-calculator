# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a **Toram Online Damage Calculator** - a web application for calculating damage in the MMORPG "Toram Online". It's built for the Japanese gaming community with a Japanese interface.

## Technology Stack
- **Framework**: Next.js 15 with App Router + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Form Management**: React Hook Form + Zod validation
- **Code Quality**: Biome (formatting & linting)

## Development Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm start           # Start production server
npm run lint        # Run Next.js ESLint
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
- `EnemyForm`: Target/enemy configuration

### Data Management Strategy
- **Hybrid Data System**: Combines static preset JSON with dynamic user LocalStorage data
- **Preset Data**: Static JSON files (`src/data/crystals.json`, `equipments.json`) 
- **User Custom Data**: LocalStorage with CRUD operations, timestamps, and export/import
- **Data Access Layer**: Unified APIs in `*Database.ts` files merge preset and user data
- **Type Safety**: Zod validation + TypeScript interfaces ensure data integrity
- **Real-time Calculation**: State changes trigger immediate stat recalculation

### Equipment System Complexity
Equipment supports 70+ properties including:
- Basic stats (ATK, DEF, HP, MP) with both flat and percentage modifiers
- Game-specific mechanics (penetration, critical rates, elemental resistances)
- Refinement system (0-15 levels)
- 8 equipment slots: Main, Body, Additional, Special, Sub weapon, Fashion 1-3

### Crystal System Architecture
- 4 crystal categories with 2 slots each (8 total slots)
- Normal crystals: Universal compatibility across all slots
- Typed crystals: Category-specific with unique properties
- Modal-based selection system with filtering and search

## Code Conventions
- **Indentation**: Tabs (configured in Biome)
- **Quotes**: Single quotes for JS, double quotes for JSX
- **Semicolons**: As needed (Biome auto-formatting)
- **Imports**: Auto-organized by Biome
- **Component Structure**: Functional components with TypeScript
- **Form Validation**: Zod schemas in `src/schemas/`
- **Type Definitions**: Centralized in `src/types/`

## Development Phase Status
- **Phase 1 (Current)**: Input forms and UI components - mostly complete
- **Phase 2 (In Progress)**: User custom equipment/crystal editing
- **Phase 3 (Planned)**: Damage calculation logic implementation

## Key Files
- `src/types/calculator.ts`: Central type definitions for all game data
- `src/data/*.json`: Preset game data (crystals, equipment)
- `src/utils/*Database.ts`: Data access layer for presets and user data
- `src/schemas/`: Zod validation schemas for forms
- Japanese documentation files in root: 要件定義書.md, 技術仕様書.md

## Testing
No testing framework is currently configured. Use manual testing via the development server.