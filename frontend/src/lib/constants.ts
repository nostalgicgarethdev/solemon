import { PublicKey } from "@solana/web3.js";

export const RPC_URL =
  import.meta.env.VITE_RPC_URL || "https://api.devnet.solana.com";

export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ||
    "GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL"
);

// Set this to your Pump.fun CA after deploy
export const TOKEN_MINT = new PublicKey(
  import.meta.env.VITE_TOKEN_MINT ||
    "So11111111111111111111111111111111111111112"
);

export const MIN_TOKEN_UI = Number(import.meta.env.VITE_MIN_TOKEN_UI || "0");
export const TOKEN_DECIMALS = 6;