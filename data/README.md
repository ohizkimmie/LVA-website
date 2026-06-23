# Library data

`cards.mjs` and `spreads.mjs` here are copies of the app's
`src/data/cards.ts` and `src/data/spreads.ts` with TypeScript syntax
stripped (interfaces removed, type annotations dropped). They feed
`scripts/build-library.mjs`, which generates the public card and
spread pages at `/cards/*` and `/spreads/*`.

## When the app's card/spread data changes

1. Copy the updated files from the app repo:

   ```bash
   cp "../Actual LVA/src/data/cards.ts"   data/cards.mjs
   cp "../Actual LVA/src/data/spreads.ts" data/spreads.mjs
   ```

2. Strip TS syntax:

   ```bash
   sed -i -E '/^export interface TarotCard \{$/,/^\}$/d' data/cards.mjs
   sed -i -E 's/: TarotCard\[\]//g; s/ as TarotCard\[\]//g'   data/cards.mjs
   sed -i -E '/^export interface SpreadPosition \{$/,/^\}$/d' data/spreads.mjs
   sed -i -E '/^export interface Spread \{$/,/^\}$/d'         data/spreads.mjs
   sed -i -E 's/: Spread\[\]//g; s/ as Spread\[\]//g'         data/spreads.mjs
   ```

3. Rebuild the library:

   ```bash
   npm run build:library
   ```

4. Commit the regenerated `cards/`, `spreads/`, and `sitemap.xml`.
