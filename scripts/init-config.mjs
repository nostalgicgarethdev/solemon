import anchor, { BN } from "@anchor-lang/core";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const idl = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../frontend/src/idl/solemon_game.json"), "utf8")
);

const PROGRAM_ID = new PublicKey("GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL");
const mint = new PublicKey(process.argv[2]);
const minBal = BigInt(process.argv[3] || "0");

const keypairPath = path.join(os.homedir(), ".config/solana/id.json");
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8")))
);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = {
  publicKey: payer.publicKey,
  signTransaction: async (tx) => {
    tx.partialSign(payer);
    return tx;
  },
  signAllTransactions: async (txs) => {
    txs.forEach((tx) => tx.partialSign(payer));
    return txs;
  },
};

const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
const program = new anchor.Program(idl, provider);

const [gameConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("game_config")],
  PROGRAM_ID
);

try {
  await program.account.gameConfig.fetch(gameConfig);
  console.log("Config exists, updating token mint...");
  await program.methods
    .updateConfig(mint, new BN(minBal.toString()))
    .accounts({ authority: payer.publicKey, gameConfig })
    .rpc();
} catch {
  await program.methods
    .initializeConfig(mint, new BN(minBal.toString()))
    .accounts({
      authority: payer.publicKey,
      gameConfig,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

console.log("Config ready.");
console.log("VITE_TOKEN_MINT=" + mint.toBase58());