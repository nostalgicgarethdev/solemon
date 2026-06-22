import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  catchWild,
  createPlayer,
  endEncounter,
  explore,
  fetchGameConfig,
  fetchPlayer,
  healTeam,
  type PlayerAccount,
} from "../lib/anchor";
import { PROGRAM_ID, TOKEN_DECIMALS } from "../lib/constants";
import { getSpecies, STARTERS } from "../lib/species";

export function Game() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [player, setPlayer] = useState<PlayerAccount | null>(null);
  const [tokenBal, setTokenBal] = useState<number | null>(null);
  const [minRequired, setMinRequired] = useState(0);
  const [tokenMint, setTokenMint] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pushLog = (msg: string) => setLog((l) => [msg, ...l].slice(0, 8));

  const refresh = useCallback(async () => {
    if (!wallet.publicKey) return;
    const cfg = await fetchGameConfig(connection);
    if (cfg) {
      setTokenMint(cfg.tokenMint.toBase58());
      setMinRequired(Number(cfg.minTokenBalance) / 10 ** TOKEN_DECIMALS);
      try {
        const ata = getAssociatedTokenAddressSync(cfg.tokenMint, wallet.publicKey);
        const bal = await connection.getTokenAccountBalance(ata);
        setTokenBal(Number(bal.value.uiAmountString ?? 0));
      } catch {
        setTokenBal(0);
      }
    }
    setPlayer(await fetchPlayer(connection, wallet.publicKey));
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  async function run(action: () => Promise<string>, ok: string) {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setLoading(true);
    setError(null);
    try {
      const sig = await action();
      pushLog(`${ok} · ${sig.slice(0, 8)}…`);
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const active = player?.team[player.activeMon];

  return (
    <div className="min-h-screen p-4 md:p-8 font-body">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-pixel text-lemon text-sm md:text-base tracking-tight">
            SOLEMON
          </h1>
          <p className="text-xs text-white/60 mt-2">
            Pokemon × Solana · on-chain battles · hold token to play
          </p>
        </div>
        <WalletMultiButton className="!bg-sol !rounded-lg !font-body" />
      </header>

      {!wallet.connected ? (
        <div className="pixel-border rounded-2xl p-10 text-center max-w-xl mx-auto bg-black/30">
          <p className="text-4xl mb-4">🎮</p>
          <p className="text-white/80">Connect wallet to enter the Solana wilds.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <aside className="mon-card rounded-xl p-4 space-y-3">
            <h2 className="font-pixel text-[10px] text-lemon">TOKEN GATE</h2>
            <p className="text-xs break-all text-white/70">CA: {tokenMint}</p>
            <p className="text-sm">
              Balance: <span className="text-lemon">{tokenBal ?? "…"}</span>
            </p>
            <p className="text-xs text-white/50">Min required: {minRequired}</p>
            <a
              className="text-xs text-sol underline"
              href={`https://pump.fun/coin/${tokenMint}`}
              target="_blank"
              rel="noreferrer"
            >
              Buy on Pump.fun ↗
            </a>
            <p className="text-[10px] text-white/40 pt-2 border-t border-white/10">
              Program: {PROGRAM_ID.toBase58().slice(0, 8)}…
            </p>
          </aside>

          <main className="lg:col-span-2 space-y-4">
            {error && (
              <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {!player ? (
              <div className="pixel-border rounded-2xl p-6 bg-black/40">
                <h2 className="font-pixel text-[10px] text-lemon mb-4">
                  CHOOSE STARTER
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {STARTERS.map((id) => {
                    const s = getSpecies(id);
                    return (
                      <button
                        key={id}
                        disabled={loading}
                        onClick={() =>
                          run(
                            () => createPlayer(wallet as any, connection, id),
                            `Started with ${s.name}`
                          )
                        }
                        className="mon-card rounded-xl p-4 hover:scale-105 transition disabled:opacity-50"
                      >
                        <div className="text-4xl mb-2">{s.emoji}</div>
                        <div className="font-pixel text-[9px]" style={{ color: s.color }}>
                          {s.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="pixel-border rounded-2xl p-6 bg-black/40 grid md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="font-pixel text-[10px] text-lemon mb-3">ACTIVE</h2>
                    {active && (
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{getSpecies(active.species).emoji}</span>
                        <div>
                          <p className="font-bold">{getSpecies(active.species).name}</p>
                          <p className="text-sm text-white/70">Lv {active.level}</p>
                          <div className="w-40 h-2 bg-black/50 rounded mt-2">
                            <div
                              className="h-full bg-green-400 rounded"
                              style={{ width: `${(active.hp / active.maxHp) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">
                            HP {active.hp}/{active.maxHp} · ATK {active.atk}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-white/50 mt-4">
                      ⚡ Energy {player.energy}/10 · W {player.wins} L {player.losses} · Caught{" "}
                      {player.catches}
                    </p>
                  </div>

                  {player.encounterActive && (
                    <div className="mon-card rounded-xl p-4 border-purple-500/50">
                      <h3 className="font-pixel text-[9px] text-purple-300 mb-2">
                        WILD ENCOUNTER
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">
                          {getSpecies(player.wildSpecies).emoji}
                        </span>
                        <div>
                          <p>{getSpecies(player.wildSpecies).name}</p>
                          <p className="text-sm">Lv {player.wildLevel}</p>
                          <p className="text-xs">
                            HP {player.wildHp}/{player.wildMaxHp}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={loading || player.encounterActive}
                    onClick={() => run(() => explore(wallet as any, connection), "Explored")}
                    className="px-4 py-3 rounded-lg bg-sol font-semibold text-sm disabled:opacity-40"
                  >
                    🔍 Explore (−1 energy)
                  </button>
                  {player.encounterActive && (
                    <>
                      <button
                        disabled={loading}
                        onClick={() =>
                          run(() => catchWild(wallet as any, connection), "Catch attempt")
                        }
                        className="px-4 py-3 rounded-lg bg-lemon text-black font-semibold text-sm disabled:opacity-40"
                      >
                        🎯 Catch (HP ≤50%)
                      </button>
                      <button
                        disabled={loading}
                        onClick={() =>
                          run(() => endEncounter(wallet as any, connection), "Fled encounter")
                        }
                        className="px-4 py-3 rounded-lg bg-white/10 text-sm disabled:opacity-40"
                      >
                        🏃 Flee
                      </button>
                    </>
                  )}
                  <button
                    disabled={loading}
                    onClick={() => run(() => healTeam(wallet as any, connection), "Team healed")}
                    className="px-4 py-3 rounded-lg bg-green-600 text-sm disabled:opacity-40"
                  >
                    💊 Heal team
                  </button>
                </div>

                <div className="mon-card rounded-xl p-4">
                  <h3 className="font-pixel text-[9px] text-lemon mb-3">YOUR TEAM</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {player.team.map((m, i) => (
                      <div key={i} className="bg-black/30 rounded-lg p-3 text-center">
                        <div className="text-2xl">{getSpecies(m.species).emoji}</div>
                        <p className="text-xs font-bold">{getSpecies(m.species).name}</p>
                        <p className="text-[10px] text-white/60">
                          Lv{m.level} · {m.hp}/{m.maxHp}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {log.length > 0 && (
              <div className="text-xs text-white/50 space-y-1 font-mono">
                {log.map((l, i) => (
                  <div key={i}>› {l}</div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}