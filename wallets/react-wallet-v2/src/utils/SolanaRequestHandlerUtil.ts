import { SOLANA_SIGNING_METHODS } from '@/data/SolanaData'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { solanaAddresses, solanaWallets } from '@/utils/SolanaWalletUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { RequestEvent } from '@walletconnect/types'
import { ERROR } from '@walletconnect/utils'

export async function approveSolanaRequest(requestEvent: RequestEvent) {
  const { method, params, id } = requestEvent.request
  const wallet = solanaWallets[getWalletAddressFromParams(solanaAddresses, params)]

  switch (method) {
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      const signedMessage = await wallet.signMessage(params.message)
      return formatJsonRpcResult(id, signedMessage)

    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      const signedTransaction = await wallet.signTransaction(params)
      return formatJsonRpcResult(id, signedTransaction)

    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS:
      const signedTransactions = await wallet.signAllTransactions(params)
      return formatJsonRpcResult(id, signedTransactions)

    default:
      throw new Error(ERROR.UNKNOWN_JSONRPC_METHOD.format().message)
  }
}

export function rejectSolanaRequest(request: RequestEvent['request']) {
  const { id } = request

  return formatJsonRpcError(id, ERROR.JSONRPC_REQUEST_METHOD_REJECTED.format().message)
}
