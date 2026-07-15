# DRUNKCHICKEN

The official intentionally ugly GeoCities-meets-anime-brainrot website for
`$DRUNKCHICKEN` on Pons Family.

## Stack

- Next.js
- React
- TypeScript
- React Bits `StarBorder`, adapted to the site
- viem for the direct Robinhood Chain swap

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The swap widget connects to an injected EVM wallet, switches it to Robinhood
Chain, fetches a live pool quote, and submits the ETH-to-DRUNKCHICKEN swap
directly from the page. The site never receives private keys.

## Production build

```bash
npm run build
```

## Token

Contract address:

```text
0xc7cA3Cade27bbD9514389C0427870770E49bfe7F
```

[View `$DRUNKCHICKEN` on Pons Family](https://pons.family/launchpad/0xc7cA3Cade27bbD9514389C0427870770E49bfe7F)
