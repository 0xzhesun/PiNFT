from ecdsa import SigningKey, SECP256k1
import sha3

def checksum_encode(addr_str): 
    keccak = sha3.keccak_256()
    addr = addr_str.lower().replace('0x', '')
    keccak.update(addr.encode('ascii'))
    hash_addr = keccak.hexdigest()
    return '0x' + ''.join(c.upper() if int(h, 16) >= 8 else c for c, h in zip(addr, hash_addr))

def generate_keys():
    keccak = sha3.keccak_256()
    priv = SigningKey.generate(curve=SECP256k1)
    pub = priv.get_verifying_key().to_string()
    keccak.update(pub)
    address = keccak.hexdigest()[24:]
    return priv.to_string().hex(), pub.hex(), checksum_encode(address)