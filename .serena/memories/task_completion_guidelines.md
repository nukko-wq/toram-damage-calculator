# Task Completion Guidelines

## After Completing Any Task

### 1. Code Quality Checks (REQUIRED)
```bash
# Always run these commands in order:
npm run lint:fix      # Auto-fix linting issues
npx tsc --noEmit     # Check for type errors
npm run build        # Verify production build works
```

### 2. Manual Testing
- Test functionality manually in development server
- Verify UI components render correctly
- Check form validation works as expected
- Test state management updates

### 3. Code Review Checklist
- [ ] Follows established TypeScript patterns
- [ ] Uses existing utilities and data access layers
- [ ] Integrates properly with Zustand stores
- [ ] Follows React Hook Form + Zod validation pattern
- [ ] Maintains Japanese UI text consistency
- [ ] No unused imports or variables
- [ ] Proper error handling implemented

## Important Development Patterns

### State Management
- Use the 3-store pattern (calculator, saveData, ui)
- Update stores through established actions
- Use custom hooks (`useCalculatorData`, `useSaveDataManager`) for component integration

### Form Integration
- Always use React Hook Form + Zod validation
- Update Zustand stores via form `watch()` subscriptions
- Follow existing form component patterns

### Data Access
- Use `*Database.ts` utilities for data access
- Never directly access preset data arrays
- Follow the unified data access layer pattern

### Equipment/Crystal Systems
- Understand multi-state system (persistent → temporary → edit → runtime)
- Use proper cleanup of temporary states
- Follow property system patterns for complex data

## Never Skip
- Type checking with `npx tsc --noEmit`
- Linting with `npm run lint:fix`
- Production build verification with `npm run build`
- Manual testing of implemented features