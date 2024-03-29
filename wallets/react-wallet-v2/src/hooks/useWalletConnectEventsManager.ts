import { COSMOS_SIGNING_METHODS } from '@/data/COSMOSData'
import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { SOLANA_SIGNING_METHODS } from '@/data/SolanaData'
import ModalStore from '@/store/ModalStore'
import { walletConnectClient } from '@/utils/WalletConnectUtil'
import { CLIENT_EVENTS } from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { useCallback, useEffect } from 'react'

export default function useWalletConnectEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback((proposal: SessionTypes.Proposal) => {
    ModalStore.open('SessionProposalModal', { proposal })
  }, [])

  /******************************************************************************
   * 2. [Optional] hanle session created
   *****************************************************************************/
  const onSessionCreated = useCallback((created: SessionTypes.Created) => {}, [])

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(async (requestEvent: SessionTypes.RequestEvent) => {
    const { topic, request } = requestEvent
    const { method } = request
    const requestSession = await walletConnectClient.session.get(topic)

    switch (method) {
      case EIP155_SIGNING_METHODS.ETH_SIGN:
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        return ModalStore.open('SessionSignModal', { requestEvent, requestSession })

      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        return ModalStore.open('SessionSignTypedDataModal', { requestEvent, requestSession })

      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        return ModalStore.open('SessionSendTransactionModal', { requestEvent, requestSession })

      case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
      case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
        return ModalStore.open('SessionSignCosmosModal', { requestEvent, requestSession })

      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS:
        return ModalStore.open('SessionSignSolanaModal', { requestEvent, requestSession })

      default:
        return ModalStore.open('SessionUnsuportedMethodModal', { requestEvent, requestSession })
    }
  }, [])

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    if (initialized) {
      walletConnectClient.on(CLIENT_EVENTS.session.proposal, onSessionProposal)

      walletConnectClient.on(CLIENT_EVENTS.session.created, onSessionCreated)

      walletConnectClient.on(CLIENT_EVENTS.session.request, onSessionRequest)
    }
  }, [initialized, onSessionProposal, onSessionCreated, onSessionRequest])
}
