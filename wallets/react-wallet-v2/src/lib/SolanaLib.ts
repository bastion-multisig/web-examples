import { Keypair } from '@solana/web3.js'
import SolanaWallet, { SolanaSignAllTransactions, SolanaSignTransaction } from 'solana-wallet'

/**
 * Types
 */
interface IInitArguments {
  secretKey?: Uint8Array
}

/**
 * Library
 */
export default class SolanaLib {
  keypair: Keypair
  solanaWallet: SolanaWallet

  constructor(keypair: Keypair) {
    this.keypair = keypair
    this.solanaWallet = new SolanaWallet(Buffer.from(keypair.secretKey))
  }

  static init({ secretKey }: IInitArguments) {
    const keypair = secretKey ? Keypair.fromSecretKey(secretKey) : Keypair.generate()

    return new SolanaLib(keypair)
  }

  public async getAddress() {
    return await this.keypair.publicKey.toBase58()
  }

  public getSecretKey() {
    return this.keypair.secretKey.toString()
  }

  public async signMessage(message: string) {
    return await this.solanaWallet.signMessage(this.keypair.publicKey.toBase58(), message)
  }

  public async signTransaction(transaction: SolanaSignTransaction) {
    return await this.solanaWallet.signTransaction(this.keypair.publicKey.toBase58(), transaction)
  }

  public async signAllTransactions(transactions: SolanaSignAllTransactions) {
    return await this.solanaWallet.signAllTransactions(
      this.keypair.publicKey.toBase58(),
      transactions
    )
  }
}
