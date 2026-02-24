

# Fix: Add `entryScript` to vite-prerender-plugin config

## Problem
The build fails with "Unable to detect prerender entry script" because the plugin cannot automatically find `src/prerender.tsx`.

## Change

### `vite.config.ts`
Add the `entryScript` option pointing to `src/prerender.tsx` inside the existing `vitePrerenderPlugin()` call. One line added:

```text
entryScript: path.resolve(__dirname, 'src/prerender.tsx'),
```

No other files change. The import style (`{ vitePrerenderPlugin }`) stays as-is since that matches the installed package's named export.

## Files Modified

| File | Change |
|------|--------|
| `vite.config.ts` | Add `entryScript` option to plugin config (line 18) |

