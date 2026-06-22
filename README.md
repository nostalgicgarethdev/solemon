# SOLEMON

Pokemon-style creature battler on Solana. Catch SOLEMONs, battle wild encounters, and level up — **fully on-chain** via Anchor.

Hold the Pump.fun token (CA) to play.

## Stack

- **On-chain:** Anchor program `solemon_game` (devnet)
- **Frontend:** React + Vite + wallet-adapter
- **Token gate:** SPL balance check against your Pump.fun CA

## Program (devnet)

```
Program ID: GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL
```

### Instructions

| Instruction | What it does |
|-------------|--------------|
| `initialize_config` | Set token mint + min balance (authority) |
| `update_config` | Update CA after Pump.fun deploy |
| `create_player` | Pick starter SOLEMON |
| `explore` | Wild encounter + battle (on-chain RNG) |
| `catch_wild` | Catch weakened wild mon |
| `heal_team` | Restore HP + energy |
| `end_encounter` | Flee without catching |

## After you deploy on Pump.fun

1. Copy your **CA (mint address)**
2. Update env vars:

```bash
VITE_TOKEN_MINT=YourPumpFunCAHere
VITE_MIN_TOKEN_UI=1000        # min tokens to play (UI amount)
VITE_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL
```

3. Run `update_config` on-chain with your CA (as program authority):

```bash
node scripts/init-config.mjs <YOUR_CA> 1000000000
```

(`1000000000` = 1000 tokens with 6 decimals)

## Local dev

```bash
npm install
npm run dev
```

## Deploy program (devnet)

```bash
npm run deploy:devnet
```

## Creatures

| # | Name | Type |
|---|------|------|
| 0 | SOLizard | SOL |
| 1 | RAYchu | RAY |
| 2 | BONKitten | BONK |
| 3 | JUPiter | JUP |
| 4 | WIFwolf | WIF |
| 5 | PENGUin | PENGU |

Starters: SOLizard, RAYchu, WIFwolf