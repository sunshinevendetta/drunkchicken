# DRUNKCHICKEN

The official intentionally ugly GeoCities-meets-anime-brainrot website for
`$DRUNKCHICKEN` on Pons Family.

## Stack

- Next.js
- React
- TypeScript
- React Bits `StarBorder`, adapted to the site
- viem for direct Robinhood Chain swaps
- WalletConnect / Reown for QR-based wallet sessions
- Persistent English / Traditional Chinese (Hong Kong) interface switcher

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The swap widget connects through an injected EVM wallet or WalletConnect,
requests Robinhood Chain, fetches a live pool quote, and submits the swap
directly from the page. The site never receives private keys.

Supported routes:

- ETH → DRUNKCHICKEN
- WETH → DRUNKCHICKEN
- DRUNKCHICKEN → WETH
- DRUNKCHICKEN → ETH, with WETH unwrapped atomically by the router

ERC-20 routes request an allowance only when the current allowance is too low.
Quote and receipt reads go through the read-only `/api/rpc` proxy, which retries
temporary upstream failures and keeps RPC credentials out of the browser.

### WalletConnect

The public Reown project ID is included for this site. Add each production
domain to its Reown allowlist. To override the ID locally, copy the example
environment file:

```bash
cp .env.example .env.local
```

```text
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=232b6e583a98af526e6f82c6432a80c3
```

Restart `npm run dev` after changing `.env.local`. The WalletConnect provider is
loaded only in the browser when the QR button is clicked.

### Production RPC

Robinhood's public RPC is rate-limited. Set the server-only
`ROBINHOOD_RPC_URL` environment variable to a production Robinhood Chain
endpoint from Alchemy or another provider. Never prefix this value with
`NEXT_PUBLIC_` because provider API keys must stay on the server.

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
