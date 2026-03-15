# Akari Extensions SDK – Phase 1

## Goal

Create the initial SDK contract that matches Akari host expectations.

## Included in phase 1

- Typed extension manifest contracts.
- `defineExtensionManifest()` helper for extension authors.
- Basic starter template under `templates/basic`.

## Compatibility target

The host currently expects:

- `hostApiVersion = "1.0.0"`
- permissions declared as string literals

## Next phases

1. Add CLI (`akari-ext`) for scaffold/build/pack.
2. Add manifest validation tooling.
3. Add package signing and integrity verification.
4. Add extension test harness for host API mocks.
