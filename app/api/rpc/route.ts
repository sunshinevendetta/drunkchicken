import { NextResponse } from "next/server";

const PUBLIC_RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const RPC_URL = process.env.ROBINHOOD_RPC_URL?.trim() || PUBLIC_RPC_URL;

const ALLOWED_METHODS = new Set([
  "eth_blockNumber",
  "eth_call",
  "eth_chainId",
  "eth_estimateGas",
  "eth_feeHistory",
  "eth_gasPrice",
  "eth_getBalance",
  "eth_getBlockByNumber",
  "eth_getCode",
  "eth_getTransactionByHash",
  "eth_getTransactionCount",
  "eth_getTransactionReceipt",
  "eth_maxPriorityFeePerGas",
]);

type JsonRpcRequest = {
  id?: number | string | null;
  jsonrpc?: string;
  method?: string;
  params?: unknown;
};

export const dynamic = "force-dynamic";

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  });
}

export async function POST(request: Request) {
  let payload: JsonRpcRequest;

  try {
    payload = await request.json() as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Invalid JSON-RPC payload.");
  }

  if (
    Array.isArray(payload) ||
    payload.jsonrpc !== "2.0" ||
    !payload.method ||
    !ALLOWED_METHODS.has(payload.method)
  ) {
    return rpcError(payload.id, -32601, "That RPC method is not available through this quote proxy.");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });

      if (response.ok) {
        return new Response(await response.text(), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        });
      }

      if (response.status !== 429 && response.status < 500) {
        return rpcError(payload.id, -32000, `Robinhood RPC rejected the request (${response.status}).`);
      }
    } catch {
      // A short retry handles public-RPC throttling and temporary network failures.
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  return rpcError(
    payload.id,
    -32005,
    "Robinhood RPC is busy after three attempts. Wait a few seconds and retry the quote.",
  );
}
