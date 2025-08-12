# CRUSH.md - ResuMate Project

## Build Commands
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build

## Code Style Guidelines

### Language Usage
- Use Svelte 5 with runes for reactive state
- Use TypeScript for all components and utilities
- Use Tailwind CSS for styling

### Component Structure
- Component files use `.svelte` extension
- Components should be in PascalCase
- Use lucide-svelte for icons
- Prefer composition over inheritance

### Imports
- Use relative paths for local imports
- Group imports: external libraries, then local imports
- Avoid default exports in favor of named exports

### Naming Conventions
- Variables: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for non-component files

### TypeScript
- Use interfaces for object shapes
- Prefer type annotations over inference when not obvious
- Use generics appropriately

### Error Handling
- Handle promises with try/catch
- Use descriptive error messages
- Log errors appropriately

### Styling
- Use Tailwind classes primarily
- Custom styles in component-specific CSS files
- Responsive design with Tailwind's breakpoints

### Testing
- No specific testing framework configured yet

### Formatting
- Follow standard Svelte and TypeScript formatting
- Use Prettier for consistent formatting