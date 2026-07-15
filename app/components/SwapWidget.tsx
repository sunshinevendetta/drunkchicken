"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatUnits,
  http,
  parseAbi,
  parseEther,
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

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
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
  transport: http(),
});

const quoterAbi = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)",
]);

const routerAbi = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
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
  return message.split("\n")[0].slice(0, 180);
}

export default function SwapWidget() {
  const [amount, setAmount] = useState("0.01");
  const [quote, setQuote] = useState<bigint | null>(null);
  const [slippageBps, setSlippageBps] = useState(500);
  const [account, setAccount] = useState<Address | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [message, setMessage] = useState("LIVE QUOTE FROM THE VERIFIED DRUNKCHICKEN POOL");
  const [txHash, setTxHash] = useState<Address | null>(null);

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
            tokenIn: WETH,
            tokenOut: TOKEN,
            amountIn,
            fee: POOL_FEE,
            sqrtPriceLimitX96: 0n,
          }],
        });
        setQuote(result[0]);
        setMessage("QUOTE READY ☆ WALLET SIGNS DIRECTLY ON ROBINHOOD CHAIN");
      } catch (error) {
        setQuote(null);
        setMessage(readableError(error));
      } finally {
        setQuoteLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [amount]);

  const formattedQuote = useMemo(() => {
    if (quote === null) return "—";
    return Number(formatUnits(quote, 18)).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }, [quote]);

  async function connectWallet() {
    if (!window.ethereum) {
      throw new Error("No browser wallet found. Install an EVM wallet that supports Robinhood Chain.");
    }

    const walletClient = createWalletClient({
      chain: robinhoodChain,
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    if (!connectedAccount) throw new Error("No wallet account selected.");

    try {
      await walletClient.switchChain({ id: robinhoodChain.id });
    } catch {
      await walletClient.addChain({ chain: robinhoodChain });
      await walletClient.switchChain({ id: robinhoodChain.id });
    }

    setAccount(connectedAccount);
    return { walletClient, connectedAccount };
  }

  async function buyToken() {
    try {
      setSwapLoading(true);
      setTxHash(null);
      setMessage("OPENING WALLET… DO NOT FEED THE POP-UP");
      const amountIn = parseEther(amount);
      if (amountIn <= 0n) throw new Error("Enter an ETH amount.");

      const { result: freshQuote } = await publicClient.simulateContract({
        address: QUOTER,
        abi: quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [{
          tokenIn: WETH,
          tokenOut: TOKEN,
          amountIn,
          fee: POOL_FEE,
          sqrtPriceLimitX96: 0n,
        }],
      });
      const minimumOut = (freshQuote[0] * BigInt(10_000 - slippageBps)) / 10_000n;
      const { walletClient, connectedAccount } = await connectWallet();

      setMessage("CONFIRM THE REAL ONCHAIN SWAP IN YOUR WALLET");
      const { request } = await publicClient.simulateContract({
        account: connectedAccount,
        address: SWAP_ROUTER,
        abi: routerAbi,
        functionName: "exactInputSingle",
        args: [{
          tokenIn: WETH,
          tokenOut: TOKEN,
          fee: POOL_FEE,
          recipient: connectedAccount,
          amountIn,
          amountOutMinimum: minimumOut,
          sqrtPriceLimitX96: 0n,
        }],
        value: amountIn,
      });

      const hash = await walletClient.writeContract(request);
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
        ✦ にわとり交換所 ✦ BUY THE BIRD ✦ ૮₍˶• . • ⑅₎ა ✦ にわとり交換所 ✦
      </div>
      <div className="swap-window">
        <div className="swap-titlebar">
          <span>🐔 REAL_SWAP.EXE</span>
          <span>{account ? `CONNECTED: ${shortAddress(account)}` : "WALLET: OFFLINE"}</span>
        </div>
        <div className="swap-headline">
          <span className="swap-face" aria-hidden="true">(づ｡◕‿‿◕｡)づ</span>
          <div>
            <p>DIRECT ONCHAIN SWAP</p>
            <h2 id="swap-title">ETH → DRUNKCHICKEN</h2>
          </div>
          <span className="swap-face" aria-hidden="true">☆ ～(&apos;▽^人)</span>
        </div>

        <div className="swap-panel">
          <label htmlFor="eth-amount">YOU PAY</label>
          <div className="swap-input-row">
            <input
              id="eth-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-describedby="swap-status"
            />
            <strong>ETH</strong>
          </div>
          <div className="swap-arrow" aria-hidden="true">⇩ 🥴 ⇩</div>
          <p className="receive-label">YOU RECEIVE (EST.)</p>
          <div className="swap-output">
            <strong>{quoteLoading ? "CALCULATING…" : formattedQuote}</strong>
            <span>DRUNKCHICKEN</span>
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

          <button type="button" onClick={buyToken} disabled={swapLoading || quote === null}>
            {swapLoading ? "WAIT 4 CHICKEN…" : account ? "SWAP NOW!!!" : "CONNECT + SWAP!!!"}
          </button>
          <p id="swap-status" className="swap-status" aria-live="polite">{message}</p>
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
          signs the transaction; this site never sees private keys. Quotes can move before confirmation.
        </p>
      </div>
    </section>
  );
}
