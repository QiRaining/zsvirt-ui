# ZSV/ZLR i18n English Default Message Replacement

## Overview

This tool replaces Chinese `defaultMessage` values in source files with the corresponding English text from i18n JSON dictionaries during build time.
For ZSV English Only builds it also works with the Rsbuild config to copy only `zstack/zsv/locale/en-US.json` into the packaged `i18n` assets.

## How It Works

```
BFF Build Request (with I18N_ENGLISH=true)
        ↓
  Pre-build Hook (package.json)
        ↓
  Script: Replace Chinese → English
        ↓
  Normal rsbuild Build
```

## Usage

### In BFF (Build For Frontend)

When triggering a ZSV build, pass the `I18N_ENGLISH` environment variable:

```bash
# Build with English default messages
I18N_ENGLISH=true pnpm build:zsv

# Explicit English Only build mode
pnpm build:zsv:english

# Or via your build system/Docker
docker run -e I18N_ENGLISH=true ...
```

### Local Development (Dry Run)

Test the replacement without modifying files:

```bash
node ./packages/i18n/scripts/replace-defaultmessage.cjs zsv --dry-run
```

### Direct Execution

```bash
# Replace ZSV Chinese messages
I18N_PRODUCT=zsv node ./packages/i18n/scripts/replace-defaultmessage.cjs

# Replace ZLR Chinese messages
I18N_PRODUCT=zlr node ./packages/i18n/scripts/replace-defaultmessage.cjs

# Use custom apps directory
ZSV_APP_DIR=/path/to/apps I18N_ENGLISH=true pnpm build:zsv

# Use custom apps + shared directories
ZSV_APP_DIR=/path/to/apps ZSV_SHARED_DIR=/path/to/shared I18N_ENGLISH=true pnpm build:zsv
```

## Configuration

### package.json (Automatic)

The `build:zsv` script in the root `package.json` already includes the pre-build hook:

```json
{
  "scripts": {
    "build:zsv": "if [ \"$ENGLISH_ONLY\" = \"true\" ] || [ \"$I18N_ENGLISH\" = \"true\" ] || [ \"$ZSV_ENGLISH_ONLY\" = \"true\" ]; then node ./packages/i18n/scripts/replace-defaultmessage.cjs zsv || exit 1; fi; nx run-many --target=build --projects=tag:product:zsv --parallel=10",
    "build:zsv:english": "ENGLISH_ONLY=true ZSV_ENGLISH_ONLY=true I18N_ENGLISH=true pnpm build:zsv"
  }
}
```

### BFF Side Integration

In your BFF build service, add the environment variable when needed:

```javascript
// Example: Docker-based build in BFF
const spawnBuild = async (config) => {
  const env = { ...process.env };

  // Enable English defaultMessage replacement for production builds
  if (config.target === "production" || config.forceEnglishI18n) {
    env.I18N_ENGLISH = "true";
  }

  await execa("pnpm", ["build:zsv"], {
    cwd: PROJECT_ROOT,
    env,
    stdio: "inherit",
  });
};
```

### Environment Variables Reference

| Variable           | Description                                                           | Default       |
| ------------------ | --------------------------------------------------------------------- | ------------- |
| `ENGLISH_ONLY`     | CI checkbox alias for English Only builds (set to "true")             | false         |
| `I18N_ENGLISH`     | Enable English replacement (set to "true")                            | false         |
| `ZSV_ENGLISH_ONLY` | Enable ZSV English Only packaging and runtime locale lock             | false         |
| `I18N_PRODUCT`     | Product name (zsv/zlr)                                                | zsv           |
| `ZSV_APP_DIR`      | Override apps directory path                                          | auto-detected |
| `ZSV_SHARED_DIR`   | Override shared directory path when `ZSV_APP_DIR` is set              | unset         |
| `ZSV_SCAN_DIRS`    | Override all scan directories, separated by the system path delimiter | unset         |

## Output Examples

### Summary Output

```
🔍 ZSV/i18n defaultMessage English replacement
============================================================
Product:    zsv
Scan dirs:
  - /path/to/zsv/apps
  - /path/to/zsv/shared
I18N path:  /path/to/packages/i18n/src/zstack/zsv/locale
Mode:       DRY RUN (no files modified)

📖 Loaded 26,121 i18n keys from en-US.json

📁 Found 3395 .ts/.tsx files to scan

✅ resource/src/pages/vm/action/create.tsx: replaced 15 Chinese messages
...

============================================================
📊 SUMMARY
============================================================
Files modified:      1855
Total replacements:  12,405

Per-app breakdown:
  resource: 5,113
  administration: 2,038
  ...

⚠️  This was a dry run. Use without --dry-run to apply changes.
```

### Warning for Unmapped Keys

If a Chinese `defaultMessage` has no corresponding English key in the dictionary:

```
⚠️   resource/src/pages/vm/detail/index.tsx: id="custom.key" has no English mapping
```

## Before/After Example

### Before (Chinese)

```typescript
intl.formatMessage({
  id: "vm.create.title",
  defaultMessage: "创建虚拟机",
});
```

### After (English)

```typescript
intl.formatMessage({
  id: "vm.create.title",
  defaultMessage: "Create Virtual Machine",
});
```

## Notes

1. **Source files are modified in place** - Use `--dry-run` first to preview changes
2. **Reversible via git** - All changes are tracked by version control
3. **i18n keys remain unchanged** - Only the `defaultMessage` value is replaced
4. **Works with both patterns**: template literals (`` `text` ``) and string literals (`"text"`)
5. **Handles multiline templates** - Template literals spanning multiple lines are correctly parsed
