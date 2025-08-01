# Suggested Commands

## Development Commands
```bash
# Start development server with Turbopack (hot reloading)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Code Quality Commands
```bash
# Run Biome linter (check for issues)
npm run lint

# Run Biome linter and auto-fix issues
npm run lint:fix

# Format code with Biome
npm run format

# Type check without emitting files
npx tsc --noEmit
```

## Development Workflow Commands
```bash
# Interactive dependency updates
npm run upgrade-interactive

# Install dependencies
npm install

# Git operations
git status
git add .
git commit -m "message"
git push
```

## System Commands (Linux)
```bash
# File operations
ls -la              # List files with details
find . -name "*.ts" # Find TypeScript files
grep -r "pattern"   # Search in files
cd directory        # Change directory

# Process management
ps aux              # List processes
kill PID            # Kill process by ID
```

## Recommended Development Flow
1. `npm run dev` - Start development server
2. Make code changes
3. `npm run lint:fix` - Auto-fix linting issues
4. `npx tsc --noEmit` - Check for type errors
5. Test functionality manually
6. `npm run build` - Verify production build works
7. Commit changes with git