# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Toram Online damage calculator web application built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The application is designed to help players calculate damage in the Toram Online game.

## Development Commands
- `npm run dev`: Start development server with Turbopack (http://localhost:3000)
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run Next.js linting
- `npm run format`: Format code with Biome

## Code Style & Formatting
This project uses Biome for code formatting and linting:
- Tabs for indentation
- Single quotes for JavaScript/TypeScript
- Double quotes for JSX attributes
- Semicolons only when needed
- Unused imports/variables generate warnings

## Architecture
- Next.js App Router architecture (src/app/)
- TypeScript with strict mode enabled
- Tailwind CSS for styling
- Japanese language application (lang="ja")
- Path aliases configured: `@/*` maps to `./src/*`

## File Structure
- `src/app/`: Next.js App Router pages and layouts
- `src/app/layout.tsx`: Root layout with Japanese locale
- `src/app/page.tsx`: Home page
- `src/app/globals.css`: Global styles