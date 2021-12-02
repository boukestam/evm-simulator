export function hexToBytes (hex: string) {
  const bytes = [];

  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes;
}

export function bytesToBigInt (bytes: number[]) {
  return BigInt('0x' + bytes.map(byte => byte.toString(16).padStart(2, '0')).join(''));
}

export function bigIntToBytes (n: bigint) {
  return hexToBytes(n.toString(16).padStart(64, '0'));
}

export function uint256 (n: bigint): bigint {
  return BigInt.asUintN(256, n);
}

export function int256 (n: bigint): bigint {
  return BigInt.asIntN(256, n);
}