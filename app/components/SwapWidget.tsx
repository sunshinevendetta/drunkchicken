"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  encodeFunctionData,
  formatUnits,
  http,
  parseAbi,
  parseEther,
  zeroAddress,
  type Address,
  type EIP1193Provider,
} from "viem";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

const TOKEN = "0xc7cA3Cade27bbD9514389C0427870770E49bfe7F" as Address;
const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as Address;
const SWAP_ROUTER = "0xCaf681a66D020601342297493863E78C959E5cb2" as Address;
const QUOTER = "0x33e885eD0Ec9bF04EcfB19341582aADCb4c8A9E7" as Address;
const POOL_FEE = 10_000;
const WALLET_RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const QUOTE_RPC_URL = "/api/rpc";
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "232b6e583a98af526e6f82c6432a80c3";

type WalletKind = "browser" | "walletconnect";
type SwapDirection = "buy" | "sell";
type BuyAsset = "ETH" | "WETH";
type SellAsset = "ETH" | "WETH";

type WalletConnectProvider = EIP1193Provider & {
  session?: unknown;
  connect(options?: {
    chains?: number[];
    rpcMap?: Record<number, string>;
  }): Promise<void>;
  disconnect(): Promise<void>;
  on(event: "accountsChanged", listener: (accounts: string[]) => void): void;
  on(event: "disconnect", listener: () => void): void;
};

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [WALLET_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});

const publicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(QUOTE_RPC_URL, {
    retryCount: 2,
    retryDelay: 300,
    timeout: 15_000,
  }),
});

const quoterAbi = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)",
]);

const routerAbi = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function unwrapWETH9(uint256 amountMinimum,address recipient) payable",
  "function multicall(bytes[] data) payable returns (bytes[] results)",
]);

const erc20Abi = parseAbi([
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
]);

function shortAddress(address: Address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function readableError(error: unknown) {
  const maybeError = error as { shortMessage?: string; message?: string };
  const message = maybeError.shortMessage ?? maybeError.message ?? "The swap could not be completed.";
  if (/rejected|denied/i.test(message)) return "Transaction cancelled in wallet.";
  if (/insufficient funds/i.test(message)) return "Not enough ETH for the swap and gas.";
  if (/slippage|amountoutminimum/i.test(message)) return "Price moved too fast. Refresh the quote and try again.";
  if (/RPC is busy|rate.?limit|429|HTTP request failed|Failed to fetch/i.test(message)) {
    return "ROBINHOOD RPC IS BUSY. WAIT A FEW SECONDS, THEN KICK THE QUOTER AGAIN.";
  }
  return message.split("\n")[0].slice(0, 180);
}

export default function SwapWidget() {
  const activeProviderRef = useRef<EIP1193Provider | null>(null);
  const walletConnectProviderRef = useRef<WalletConnectProvider | null>(null);
  const [amount, setAmount] = useState("0.01");
  const [direction, setDirection] = useState<SwapDirection>("buy");
  const [buyAsset, setBuyAsset] = useState<BuyAsset>("ETH");
  const [sellAsset, setSellAsset] = useState<SellAsset>("WETH");
  const [quote, setQuote] = useState<bigint | null>(null);
  const [slippageBps, setSlippageBps] = useState(500);
  const [account, setAccount] = useState<Address | null>(null);
  const [walletKind, setWalletKind] = useState<WalletKind | null>(null);
  const [walletLoading, setWalletLoading] = useState<WalletKind | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [swapLoading, setSwapLoading] = useState(false);
  const [message, setMessage] = useState("LIVE QUOTE FROM THE VERIFIED DRUNKCHICKEN POOL");
  const [txHash, setTxHash] = useState<Address | null>(null);
  const tokenIn = direction === "buy" ? WETH : TOKEN;
  const tokenOut = direction === "buy" ? TOKEN : WETH;
  const inputAsset = direction === "buy" ? buyAsset : "DRUNKCHICKEN";
  const outputAsset = direction === "buy" ? "DRUNKCHICKEN" : sellAsset;

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const amountIn = parseEther(amount);
        if (amountIn <= 0n) throw new Error("Enter an ETH amount.");
        setQuoteLoading(true);
        const { result } = await publicClient.simulateContract({
          address: QUOTER,
          abi: quoterAbi,
          functionName: "quoteExactInputSingle",
          args: [{
            tokenIn,
            tokenOut,
            amountIn,
            fee: POOL_FEE,
            sqrtPriceLimitX96: 0n,
          }],
        });
        setQuote(result[0]);
        setMessage(`QUOTE READY ☆ ${inputAsset} → ${outputAsset} ON ROBINHOOD CHAIN`);
      } catch (error) {
        setQuote(null);
        setMessage(readableError(error));
      } finally {
        setQuoteLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [amount, inputAsset, outputAsset, quoteAttempt, tokenIn, tokenOut]);

  const formattedQuote = useMemo(() => {
    if (quote === null) return "—";
    return Number(formatUnits(quote, 18)).toLocaleString(undefined, {
      maximumFractionDigits: direction === "buy" ? 0 : 8,
    });
  }, [direction, quote]);

  function walletClientFor(provider: EIP1193Provider) {
    const walletClient = createWalletClient({
      chain: robinhoodChain,
      transport: custom(provider),
    });
    return walletClient;
  }

  async function connectBrowserWallet() {
    try {
      setWalletLoading("browser");
      setMessage("LOOKING FOR A BROWSER WALLET…");
      if (!window.ethereum) {
        throw new Error(
          "No browser wallet found. Use WalletConnect QR or install an EVM wallet.",
        );
      }

      const walletClient = walletClientFor(window.ethereum);
      const [connectedAccount] = await walletClient.requestAddresses();
      if (!connectedAccount) throw new Error("No wallet account selected.");

      try {
        await walletClient.switchChain({ id: robinhoodChain.id });
      } catch {
        await walletClient.addChain({ chain: robinhoodChain });
        await walletClient.switchChain({ id: robinhoodChain.id });
      }

      activeProviderRef.current = window.ethereum;
      setAccount(connectedAccount);
      setWalletKind("browser");
      setMessage("BROWSER WALLET CONNECTED ☆ ROBINHOOD CHAIN READY");
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setWalletLoading(null);
    }
  }

  async function connectWalletConnect() {
    try {
      setWalletLoading("walletconnect");
      setMessage("OPENING WALLETCONNECT QR… MOBILE CHICKENS INCOMING");
      if (!WALLETCONNECT_PROJECT_ID) {
        throw new Error(
          "WalletConnect is not configured. Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local.",
        );
      }

      let provider = walletConnectProviderRef.current;
      if (!provider) {
        const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
        const initializedProvider = await EthereumProvider.init({
          projectId: WALLETCONNECT_PROJECT_ID,
          optionalChains: [robinhoodChain.id],
          showQrModal: true,
          rpcMap: { [robinhoodChain.id]: WALLET_RPC_URL },
          methods: ["eth_sendTransaction", "personal_sign"],
          events: ["chainChanged", "accountsChanged"],
          metadata: {
            name: "DRUNKCHICKEN",
            description: "Direct DRUNKCHICKEN swap on Robinhood Chain",
            url: window.location.origin,
            icons: [new URL("/og.png", window.location.origin).toString()],
          },
        });

        provider = initializedProvider as unknown as WalletConnectProvider;
        provider.on("accountsChanged", (accounts) => {
          setAccount((accounts[0] as Address | undefined) ?? null);
        });
        provider.on("disconnect", () => {
          activeProviderRef.current = null;
          walletConnectProviderRef.current = null;
          setAccount(null);
          setWalletKind(null);
          setMessage("WALLETCONNECT DISCONNECTED. THE CHICKEN IS ALONE AGAIN.");
        });
        walletConnectProviderRef.current = provider;
      }

      if (!provider.session) {
        await provider.connect({
          chains: [robinhoodChain.id],
          rpcMap: { [robinhoodChain.id]: WALLET_RPC_URL },
        });
      }

      const walletClient = walletClientFor(provider);
      const [connectedAccount] = await walletClient.requestAddresses();
      if (!connectedAccount) throw new Error("No wallet account selected.");

      const connectedChain = await walletClient.getChainId();
      if (connectedChain !== robinhoodChain.id) {
        throw new Error("Approve Robinhood Chain in WalletConnect, then try again.");
      }

      activeProviderRef.current = provider;
      setAccount(connectedAccount);
      setWalletKind("walletconnect");
      setMessage("WALLETCONNECT LINKED ☆ ROBINHOOD CHAIN READY");
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setWalletLoading(null);
    }
  }

  async function disconnectWallet() {
    if (walletKind === "walletconnect" && walletConnectProviderRef.current) {
      await walletConnectProviderRef.current.disconnect().catch(() => undefined);
      walletConnectProviderRef.current = null;
    }
    activeProviderRef.current = null;
    setAccount(null);
    setWalletKind(null);
    setMessage("WALLET FORGOTTEN. CONNECT AGAIN WHEN THE ROOM STOPS SPINNING.");
  }

  function changeDirection(nextDirection: SwapDirection) {
    setDirection(nextDirection);
    setAmount(nextDirection === "buy" ? "0.01" : "1000000");
    setTxHash(null);
    setMessage(
      nextDirection === "buy"
        ? "BUY MODE… PICK ETH OR WETH AND AIM AT THE CHICKEN"
        : "SELL MODE… PICK WETH OR UNWRAPPED ETH",
    );
  }

  async function executeSwap() {
    try {
      setSwapLoading(true);
      setTxHash(null);
      setMessage("OPENING WALLET… DO NOT FEED THE POP-UP");
      const amountIn = parseEther(amount);
      if (amountIn <= 0n) throw new Error("Enter an ETH amount.");
      if (!account || !activeProviderRef.current) {
        throw new Error("Connect a browser wallet or WalletConnect first.");
      }

      const { result: freshQuote } = await publicClient.simulateContract({
        address: QUOTER,
        abi: quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [{
            tokenIn,
            tokenOut,
          amountIn,
          fee: POOL_FEE,
          sqrtPriceLimitX96: 0n,
        }],
      });
      const minimumOut = (freshQuote[0] * BigInt(10_000 - slippageBps)) / 10_000n;
      const connectedAccount = account;
      const walletClient = walletClientFor(activeProviderRef.current);

      if (inputAsset !== "ETH") {
        const allowance = await publicClient.readContract({
          address: tokenIn,
          abi: erc20Abi,
          functionName: "allowance",
          args: [connectedAccount, SWAP_ROUTER],
        });

        if (allowance < amountIn) {
          setMessage(`APPROVE ${inputAsset}… ONE WALLET CONFIRMATION BEFORE THE SWAP`);
          const { request: approvalRequest } = await publicClient.simulateContract({
            account: connectedAccount,
            address: tokenIn,
            abi: erc20Abi,
            functionName: "approve",
            args: [SWAP_ROUTER, amountIn],
          });
          const approvalHash = await walletClient.writeContract(approvalRequest);
          const approvalReceipt = await publicClient.waitForTransactionReceipt({
            hash: approvalHash,
          });
          if (approvalReceipt.status !== "success") {
            throw new Error(`${inputAsset} approval reverted onchain.`);
          }
        }
      }

      setMessage("CONFIRM THE ONCHAIN SWAP IN YOUR WALLET");
      const swapParams = {
        tokenIn,
        tokenOut,
        fee: POOL_FEE,
        recipient: outputAsset === "ETH" ? zeroAddress : connectedAccount,
        amountIn,
        amountOutMinimum: minimumOut,
        sqrtPriceLimitX96: 0n,
      } as const;

      let hash: Address;
      if (outputAsset === "ETH") {
        const calls = [
          encodeFunctionData({
            abi: routerAbi,
            functionName: "exactInputSingle",
            args: [swapParams],
          }),
          encodeFunctionData({
            abi: routerAbi,
            functionName: "unwrapWETH9",
            args: [minimumOut, connectedAccount],
          }),
        ];
        const { request } = await publicClient.simulateContract({
          account: connectedAccount,
          address: SWAP_ROUTER,
          abi: routerAbi,
          functionName: "multicall",
          args: [calls],
        });
        hash = await walletClient.writeContract(request);
      } else {
        const { request } = await publicClient.simulateContract({
          account: connectedAccount,
          address: SWAP_ROUTER,
          abi: routerAbi,
          functionName: "exactInputSingle",
          args: [swapParams],
          value: inputAsset === "ETH" ? amountIn : 0n,
        });
        hash = await walletClient.writeContract(request);
      }

      setTxHash(hash);
      setMessage("TRANSACTION SENT… CHICKEN IS CROSSING THE CHAIN");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("The transaction reverted onchain.");
      setMessage("SUCCESS!!! DRUNKCHICKEN HAS ENTERED THE WALLET ☆彡");
    } catch (error) {
      setMessage(readableError(error));
    } finally {
      setSwapLoading(false);
    }
  }

  return (
    <section id="swap" className="swap-zone" aria-labelledby="swap-title">
      <div className="swap-anime-rail" aria-hidden="true">
        ✦ <span lang="ja">にわとり交換所</span> ✦ <span lang="zh-CN">小鸡交换所</span> ✦ BUY
        THE BIRD ✦ ૮₍˶• . • ⑅₎ა ✦ <span lang="zh-CN">立即换鸡</span> ✦
      </div>
      <div className="swap-window">
        <div className="swap-titlebar">
          <span>🐔 swap_REAL_final_FINAL2_use_this.exe</span>
          <span>
            {account
              ? `${walletKind === "walletconnect" ? "WC" : "BROWSER"}: ${shortAddress(account)}`
              : "WALLET: OFFLINE"}
          </span>
        </div>
        <div className="swap-headline">
          <span className="swap-face" aria-hidden="true">(づ｡◕‿‿◕｡)づ</span>
          <div>
            <p>DIRECT ONCHAIN SWAP</p>
            <h2 id="swap-title">{inputAsset} → {outputAsset}</h2>
          </div>
          <span className="swap-face" aria-hidden="true">☆ ～(&apos;▽^人)</span>
        </div>

        <div className="swap-panel">
          <div className="route-tabs" role="group" aria-label="Swap direction">
            <button
              type="button"
              className={direction === "buy" ? "is-active" : ""}
              aria-pressed={direction === "buy"}
              onClick={() => changeDirection("buy")}
            >
              BUY CHICKEN
            </button>
            <button
              type="button"
              className={direction === "sell" ? "is-active" : ""}
              aria-pressed={direction === "sell"}
              onClick={() => changeDirection("sell")}
            >
              SELL CHICKEN
            </button>
          </div>
          <label htmlFor="swap-amount">YOU PAY</label>
          <div className="swap-input-row">
            <input
              id="swap-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-describedby="swap-status"
            />
            {direction === "buy" ? (
              <select
                className="asset-select"
                aria-label="Asset to pay"
                value={buyAsset}
                onChange={(event) => setBuyAsset(event.target.value as BuyAsset)}
              >
                <option value="ETH">ETH</option>
                <option value="WETH">WETH</option>
              </select>
            ) : (
              <strong>DRUNKCHICKEN</strong>
            )}
          </div>
          <div className="swap-arrow" aria-hidden="true">⇩ 🥴 ⇩</div>
          <p className="receive-label">YOU RECEIVE (EST.)</p>
          <div className="swap-output">
            <strong>{quoteLoading ? "CALCULATING…" : formattedQuote}</strong>
            {direction === "sell" ? (
              <select
                className="asset-select"
                aria-label="Asset to receive"
                value={sellAsset}
                onChange={(event) => setSellAsset(event.target.value as SellAsset)}
              >
                <option value="WETH">WETH</option>
                <option value="ETH">ETH</option>
              </select>
            ) : (
              <span>DRUNKCHICKEN</span>
            )}
          </div>

          <div className="slippage-row">
            <label htmlFor="slippage">MAX SLIPPAGE</label>
            <select
              id="slippage"
              value={slippageBps}
              onChange={(event) => setSlippageBps(Number(event.target.value))}
            >
              <option value={100}>1%</option>
              <option value={300}>3%</option>
              <option value={500}>5%</option>
              <option value={1000}>10%</option>
            </select>
          </div>

          <div className="wallet-options" role="group" aria-label="Choose wallet connection">
            <button
              type="button"
              className={walletKind === "browser" ? "is-active" : ""}
              aria-pressed={walletKind === "browser"}
              onClick={connectBrowserWallet}
              disabled={walletLoading !== null || swapLoading}
            >
              {walletLoading === "browser" ? "SEARCHING…" : "🦊 BROWSER WALLET"}
            </button>
            <button
              type="button"
              className={walletKind === "walletconnect" ? "is-active" : ""}
              aria-pressed={walletKind === "walletconnect"}
              onClick={connectWalletConnect}
              disabled={walletLoading !== null || swapLoading}
            >
              {walletLoading === "walletconnect" ? "OPENING QR…" : "📱 WALLETCONNECT QR"}
            </button>
          </div>

          {!WALLETCONNECT_PROJECT_ID && (
            <p className="wallet-config-warning">
              ADMIN: ADD NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID TO ENABLE QR CONNECTIONS.
            </p>
          )}

          {account && (
            <div className="wallet-connected">
              <span>CONNECTED VIA {walletKind === "walletconnect" ? "WALLETCONNECT" : "BROWSER"}</span>
              <button type="button" onClick={disconnectWallet}>DISCONNECT</button>
            </div>
          )}

          <button
            type="button"
            onClick={executeSwap}
            disabled={swapLoading || quote === null || account === null}
          >
            {swapLoading ? "WAIT 4 CHICKEN…" : account ? "SWAP NOW!!!" : "CONNECT A WALLET FIRST"}
          </button>
          <p id="swap-status" className="swap-status" aria-live="polite">{message}</p>
          {quote === null && !quoteLoading && (
            <button
              type="button"
              className="quote-retry"
              onClick={() => setQuoteAttempt((attempt) => attempt + 1)}
            >
              🔄 KICK THE QUOTER AGAIN
            </button>
          )}
          {txHash && (
            <a
              className="tx-link"
              href={`https://robinhoodchain.blockscout.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              VIEW TRANSACTION RECEIPT ↗
            </a>
          )}
        </div>

        <p className="swap-disclaimer">
          Uses the verified DRUNKCHICKEN / WETH pool and Robinhood Chain contracts. Your wallet
          signs the transaction through a browser wallet or WalletConnect; this site never sees
          private keys. ERC-20 routes may require approval first. ETH output unwraps WETH atomically.
          Quotes can move before confirmation.
        </p>
      </div>
    </section>
  );
}
