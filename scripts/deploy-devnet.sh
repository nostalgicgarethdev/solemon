#!/bin/bash
set -e

export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"
cd "$(dirname "$0")/../solemon_game"

echo "Building program..."
anchor build

echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet

CONFIG_PDA=$(node -e "
const { PublicKey } = require('@solana/web3.js');
const [pda] = PublicKey.findProgramAddressSync([Buffer.from('game_config')], new PublicKey('GwTaRnwmL5qXbmdAqNdcoWeuWFxNLcNiWoNmRFNGhPdL'));
console.log(pda.toBase58());
")

echo "Game config PDA: $CONFIG_PDA"

# Create test token mint if not initialized
if ! solana account "$CONFIG_PDA" --url devnet 2>/dev/null | grep -q "Balance"; then
  echo "Creating test SPL mint for devnet..."
  MINT=$(spl-token create-token --decimals 6 --url devnet 2>&1 | grep "Creating token" | awk '{print $3}')
  spl-token mint "$MINT" 1000000 --url devnet
  spl-token create-account "$MINT" --url devnet

  echo "Initializing game config (min balance = 0 for testing)..."
  anchor run --provider.cluster devnet -s initialize || true

  node ../scripts/init-config.mjs "$MINT" 0
  echo "TOKEN_MINT=$MINT" > ../frontend/.env.local
else
  echo "Game config already exists."
fi

echo "Done. Copy frontend/.env.local to Vercel env vars."