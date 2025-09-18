export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
    value ?? 0
  )

export const formatMoney = formatCurrency
