import { AnchorProvider, Program, Idl, BN } from "@anchor-lang/core";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/solemon_game.json";
import { PROGRAM_ID } from "./constants";
import { gameConfigPda, playerPda } from "./pdas";

export type Mon = {
  species: number;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  xp: number;
};

export type PlayerAccount = {
  owner: PublicKey;
  team: Mon[];
  teamLen: number;
  activeMon: number;
  energy: number;
  wins: number;
  losses: number;
  catches: number;
  wildSpecies: number;
  wildLevel: number;
  wildHp: number;
  wildMaxHp: number;
  encounterActive: boolean;
};

export type GameConfigAccount = {
  authority: PublicKey;
  tokenMint: PublicKey;
  minTokenBalance: BN;
  totalPlayers: number;
  totalBattles: number;
  totalCatches: number;
};

function getProgram(wallet: AnchorWallet, connection: Connection) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl as Idl, provider);
}

function playerAta(owner: PublicKey, mint: PublicKey) {
  return getAssociatedTokenAddressSync(mint, owner, false);
}

export async function fetchGameConfig(connection: Connection) {
  const program = new Program(idl as Idl, new AnchorProvider(connection, {} as AnchorWallet, {}));
  try {
    const acc = await (program.account as any).gameConfig.fetch(gameConfigPda());
    return {
      authority: acc.authority as PublicKey,
      tokenMint: acc.tokenMint as PublicKey,
      minTokenBalance: acc.minTokenBalance as BN,
      totalPlayers: acc.totalPlayers as number,
      totalBattles: acc.totalBattles as number,
      totalCatches: acc.totalCatches as number,
    } as GameConfigAccount;
  } catch {
    return null;
  }
}

export async function fetchPlayer(connection: Connection, owner: PublicKey) {
  const program = new Program(idl as Idl, new AnchorProvider(connection, {} as AnchorWallet, {}));
  try {
    const acc = await (program.account as any).player.fetch(playerPda(owner));
    return parsePlayer(acc);
  } catch {
    return null;
  }
}

function parsePlayer(acc: any): PlayerAccount {
  const team = (acc.team as any[]).slice(0, acc.teamLen).map((m) => ({
    species: m.species as number,
    level: m.level as number,
    hp: m.hp as number,
    maxHp: m.maxHp as number,
    atk: m.atk as number,
    def: m.def as number,
    xp: m.xp as number,
  }));
  return {
    owner: acc.owner as PublicKey,
    team,
    teamLen: acc.teamLen as number,
    activeMon: acc.activeMon as number,
    energy: acc.energy as number,
    wins: acc.wins as number,
    losses: acc.losses as number,
    catches: acc.catches as number,
    wildSpecies: acc.wildSpecies as number,
    wildLevel: acc.wildLevel as number,
    wildHp: acc.wildHp as number,
    wildMaxHp: acc.wildMaxHp as number,
    encounterActive: acc.encounterActive as boolean,
  };
}

export async function createPlayer(wallet: AnchorWallet, connection: Connection, starter: number) {
  const program = getProgram(wallet, connection);
  const config = gameConfigPda();
  const cfg = await (program.account as any).gameConfig.fetch(config);
  const owner = wallet.publicKey;
  const ata = playerAta(owner, cfg.tokenMint);
  return program.methods
    .createPlayer(starter)
    .accounts({
      owner,
      gameConfig: config,
      player: playerPda(owner),
      playerTokenAccount: ata,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function explore(wallet: AnchorWallet, connection: Connection) {
  const program = getProgram(wallet, connection);
  const config = gameConfigPda();
  const cfg = await (program.account as any).gameConfig.fetch(config);
  const owner = wallet.publicKey;
  return program.methods
    .explore()
    .accounts({
      owner,
      gameConfig: config,
      player: playerPda(owner),
      playerTokenAccount: playerAta(owner, cfg.tokenMint),
    })
    .rpc();
}

export async function catchWild(wallet: AnchorWallet, connection: Connection) {
  const program = getProgram(wallet, connection);
  const config = gameConfigPda();
  const cfg = await (program.account as any).gameConfig.fetch(config);
  const owner = wallet.publicKey;
  return program.methods
    .catchWild()
    .accounts({
      owner,
      gameConfig: config,
      player: playerPda(owner),
      playerTokenAccount: playerAta(owner, cfg.tokenMint),
    })
    .rpc();
}

export async function healTeam(wallet: AnchorWallet, connection: Connection) {
  const program = getProgram(wallet, connection);
  const config = gameConfigPda();
  const cfg = await (program.account as any).gameConfig.fetch(config);
  const owner = wallet.publicKey;
  return program.methods
    .healTeam()
    .accounts({
      owner,
      gameConfig: config,
      player: playerPda(owner),
      playerTokenAccount: playerAta(owner, cfg.tokenMint),
    })
    .rpc();
}

export async function endEncounter(wallet: AnchorWallet, connection: Connection) {
  const program = getProgram(wallet, connection);
  const owner = wallet.publicKey;
  return program.methods
    .endEncounter()
    .accounts({ owner, player: playerPda(owner) })
    .rpc();
}

export { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, playerAta };