export async function initiateDeposit(amount, card) {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));
  const requires3ds = Math.random() < 0.5;
  if (requires3ds) {
    return { requires3ds: true, transactionId: Date.now().toString() };
  }
  const success = Math.random() < 0.9;
  return { success };
}

export async function confirm3ds(transactionId, approved) {
  await new Promise(res => setTimeout(res, 1000));
  if (!approved) return { success: false };
  const success = Math.random() < 0.9;
  return { success };
}
