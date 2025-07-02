# Arkadia Map Extensions - Development Guidelines

## Build/Configuration Instructions

### Project Structure
This is a **monorepo** managed by **Lerna** with the following workspaces:

| Package     | Description                                                       |
|-------------|-------------------------------------------------------------------|
| `extension` | Ready-to-use extension                                            |
| `client`    | Content script, contains client modifications and scripts        |
| `map`       | Map iframe                                                        |
| `options`   | Extension options page                                            |
| `scripts`   | Helper scripts for generating data files                          |
| `sandbox`   | Development sandbox (not part of published extension)            |

### Prerequisites
- **Node.js** (compatible with Yarn 1.22.22)
- **Yarn 1.22.22** (specified as packageManager)

### Build Process
1. **Install dependencies**: `yarn install` (installs for all workspaces)
2. **Development build**: `yarn watch` (runs Lerna watch across all workspaces)
3. **Production build**: `yarn build` (builds all workspaces and creates extension zip)

### Workspace-Specific Commands
You can also run scripts for individual workspaces:
```bash
# Build specific workspace
yarn workspace client build
yarn workspace map build
yarn workspace options build

# Run tests for client workspace
yarn workspace client test
```

### Client Workspace Specifics
- **Entry point**: `client/src/main.ts`
- **Output**: `extension/dist/main.js`
- **Build tool**: Webpack with ts-loader
- **TypeScript config**: Targets ES2021, CommonJS modules
- **Development mode**: Includes inline source maps

## Testing Information

### Test Framework
- **Jest** with TypeScript support (`ts-jest`)
- **Environment**: JSDOM for DOM testing
- **Configuration**: `client/jest.config.js`

### Running Tests
```bash
# Run all tests
yarn --cwd client test

# Run specific test file
yarn --cwd client test filename.test.ts

# Run tests in watch mode
yarn --cwd client test --watch
```

### Test Structure
- **Test location**: `client/test/` directory
- **Naming convention**: `*.test.ts`
- **Test environment**: JSDOM (for DOM manipulation testing)

### Adding New Tests
1. Create test file in `client/test/` with `.test.ts` extension
2. Use Jest's `describe` and `test` functions
3. Example test structure:
```typescript
describe('Feature Name', () => {
    test('should test specific functionality', () => {
        // Test implementation
        expect(result).toBe(expected);
    });
});
```

### Example Test Execution
The project includes comprehensive test coverage with 60+ tests across 16 test suites. Most tests pass consistently, with occasional mock-related issues in specific scenarios (e.g., `attackBeep.test.ts`).

## Additional Development Information

### Code Style Guidelines

#### TypeScript Configuration
- **Target**: ES2021
- **Module system**: CommonJS
- **Strict mode**: Disabled, but specific linting rules enabled:
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedSideEffectImports: true`

#### Naming Conventions
- **Classes**: PascalCase (e.g., `Client`, `PackageHelper`)
- **Methods/Functions**: camelCase (e.g., `addEventListener`, `sendCommand`)
- **Properties**: camelCase (e.g., `eventTarget`, `packageHelper`)
- **Files**: camelCase for TypeScript files (e.g., `attackBeep.ts`, `inlineCompassRose.ts`)

#### Architecture Patterns
- **Event-driven architecture**: Heavy use of `EventTarget` and `CustomEvent`
- **Dependency injection**: Client class instantiates and manages helper classes
- **Modular design**: Features separated into individual script files
- **Chrome extension integration**: Uses `chrome.runtime.Port` for background communication

#### Regular Expressions
**CRITICAL**: Never use Polish letters in regular expressions (as specified in AGENTS.md)

#### File Organization
- **Main client code**: `client/src/`
- **Feature scripts**: `client/src/scripts/`
- **Type definitions**: `client/src/types/`
- **Tests**: `client/test/`
- **Static data**: JSON files in `client/src/` (e.g., `blockers.json`, `people.json`)

### Development Workflow
1. Make changes in appropriate workspace
2. Run tests to ensure no regressions: `yarn --cwd client test`
3. Use watch mode for development: `yarn watch`
4. Build final extension: `yarn build`

### Sandbox Development
The sandbox is a separate application useful for local testing without packaging the extension:

```bash
cd sandbox
yarn install
yarn vite build --mode development
```

Then open `http://localhost:5173` in your browser to test features locally.

### Debugging
- **Source maps**: Available in development mode
- **Console logging**: Used throughout codebase for debugging
- **Chrome DevTools**: Full support for extension debugging

### Extension-Specific Notes
- **Sound integration**: Uses Howler.js for audio playback
- **DOM manipulation**: Direct DOM access for UI elements
- **Game integration**: Interfaces with Arkadia MUD client
- **Map rendering**: Uses `mudlet-map-renderer` package
