import { SolanaWalletProvider } from "./components/WalletContext";
import { Game } from "./components/Game";

export default function App() {
  return (
    <SolanaWalletProvider>
      <Game />
    </SolanaWalletProvider>
  );
}