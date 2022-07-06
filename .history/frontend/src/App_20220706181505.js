import './App.css';
import { useEffect, useState } from "react";
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';


const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed",
};
const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
  }
  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet is found");
          const response = await solana.connect({
            onlyIfTrustedIs: true,
          });
          console.log("Connected with public key", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        } else {
          alert("Solana object not found! Get a Phantom wallet");
        }
      }
    } catch(error) {
      console.error(error)
    }
  };
  const connectWallet = async () => {
    const {solana} = window;
    if (solana) {
      const response = await solana.connect()
      console.log("Connected with public key", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider)
      const [campaign] = await PublicKey.findProgramAddress([
        utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
      );
    } catch(error) {
      console.error('Error creating campaign account:', error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to wallet</button>
  );
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">{!walletAddress && renderNotConnectedContainer()}</div>

};

export default App;
