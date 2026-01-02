export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | 'draft'

export interface InvoiceDto {
  id: string
  number: string | null
  amount: number
  currency: string
  status: InvoiceStatus
  createdAt: Date
  pdfUrl: string | null
  hostedInvoiceUrl: string | null
}

export interface InvoiceListResponse {
  invoices: InvoiceDto[]
  hasMore: boolean
  totalCount?: number
}
