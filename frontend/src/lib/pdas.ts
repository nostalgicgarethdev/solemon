import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function gameConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_config")],
    PROGRAM_ID
  );
  return pda;
}

export function playerPda(owner: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player"), owner.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}