
// types/wallet.d.ts
interface WalletOperationResult {
  success: boolean
  message: string
  orderId?: string
  newBalance?: number
  error?: string
}
