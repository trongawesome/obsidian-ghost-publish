# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin that publishes notes to Ghost CMS. It's a fork of obsidian-ghost-publish that converts Obsidian markdown files to Ghost posts via the Ghost Admin API.

## Build Commands

**Package Manager**: This project uses PNPM exclusively (enforced via preinstall script).

```bash
# Install dependencies
pnpm i

# Development build (compiles and copies to test vault)
pnpm dev

# Production build
pnpm build

# Type check without emitting
tsc -noEmit -skipLibCheck
```

The build process:
1. Runs TypeScript type checking (`tsc -noEmit -skipLibCheck`)
2. Bundles with esbuild via `esbuild.config.mjs`
3. In dev mode, copies `main.js` to `./test-obsidian-vault/.obsidian/plugins/send-to-ghost/`

## Architecture

**Entry Point**: `src/main.ts` - defines the `GhostPublish` plugin class

**Core Flow**:
1. Plugin loads settings from Obsidian's data store (`loadSettings()`)
2. User triggers publish via ribbon icon or command palette
3. `publishPost()` in `src/methods/publishPost.ts` handles the entire publishing process:
   - Extracts frontmatter using `gray-matter`
   - Converts markdown to HTML using `markdown-it`
   - Creates JWT token from Admin API Key (format: `id:secret`)
   - Posts to Ghost Admin API v4 endpoint
   - Shows success/error notices

**Key Files**:
- `src/main.ts` - Plugin initialization, ribbon icon, command registration
- `src/methods/publishPost.ts` - Core publishing logic, API authentication, markdown conversion
- `src/settingTab/index.ts` - Settings UI (Site URL, Access Token, Debug Mode)
- `src/types/index.ts` - TypeScript interfaces for settings and content

**Authentication**:
- Uses Ghost Admin API Key format `id:secret` OR Staff Access Token
- JWT signed with HS256 algorithm, 5-minute expiration
- Token validation happens in `publishPost.ts:27-36`

**Frontmatter Schema**:
The plugin reads these fields from note frontmatter (all optional except title):
- `title` - defaults to filename
- `tags` - array of strings
- `featured` - boolean
- `published` - boolean (determines draft vs published status)
- `excerpt` - string
- `feature_image` - string URL

**Settings Storage**:
Settings are persisted via Obsidian's `loadData()`/`saveData()` API and typed as `SettingsProp`:
- `url`: Ghost site URL
- `adminToken`: Admin API Key or Staff Access Token
- `debug`: Enables console logging of requests/responses

## Development Notes

**External Dependencies**: The esbuild config marks Obsidian API and CodeMirror packages as external - they're provided by the Obsidian runtime.

**Debug Mode**: When enabled in settings, logs request/response JSON to console (see `publishPost.ts:54-56`, `71-73`).

**Error Handling**: The plugin validates API key format (must contain `:` for Admin API Key) and provides user-friendly notices for connection failures and API errors.
