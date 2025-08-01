# Project Overview

## Purpose
This is a **Toram Online Damage Calculator** - a sophisticated web application for calculating damage in the MMORPG "Toram Online". It's built specifically for the Japanese gaming community with a Japanese interface.

## Key Features
- Multi-form input system for character stats, equipment, buffs, and enemy configuration
- Real-time HP/MP calculations with exact Toram Online formulas
- Complex equipment system with 70+ properties and refinement levels
- Crystal system with 4 categories and 8 total slots
- Buff system integration (skills, food, items, register effects)
- User custom data management with LocalStorage persistence
- Save/Load system with multiple save slots

## Development Status
- **Phase 1 (Complete)**: Input forms, UI components, HP/MP calculations
- **Phase 2 (Complete)**: User custom equipment/crystal editing, buff systems
- **Phase 3 (Planned)**: Full damage calculation engine implementation

## Architecture
- Built with Next.js 15 App Router and React 19
- TypeScript with strict mode
- Zustand for state management (3-store pattern)
- React Hook Form + Zod for form validation
- Tailwind CSS v4 for styling
- Biome for code quality (linting & formatting)