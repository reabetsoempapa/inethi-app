export const isValidWalletAddress = address => {
  // Check if the address is a non-empty string
  if (typeof address !== 'string' || address.trim() === '') {
    return false;
  }

  // Check if the address matches the expected format
  const walletAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return walletAddressRegex.test(address);
};
