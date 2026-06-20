#!/usr/bin/env python3
"""
Generate a ZATCA-compliant ECDSA CSR.

Curve: secp256k1 — confirmed from decoded ZATCA-issued certificates and
working open-source implementations. Documentation says P-256 but the
actual ZATCA gateway uses secp256k1.

Fields go in Subject DN with UTF8String encoding (not SAN extension).
"""

import base64
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.x509.oid import NameOID
from cryptography.x509.name import _ASN1Type

# ── Configuration ─────────────────────────────────────────────────────────────
VAT_NUMBER        = "310712587200003"
ORG_NAME          = "Tahawwul Telecom and IT Company"
BRANCH_NAME       = "Main Branch"
SERIAL_NUMBER     = "1-Tahawwul|2-EGS1-001|3-MCP"  # SN: 1-name|2-serial|3-solution
CITY              = "Riyadh"
COUNTRY           = "SA"
BUSINESS_TYPE     = "1100"          # 1100=B2B+B2C, 0100=B2B only, 1000=B2C only
BUSINESS_CATEGORY = "Technology"
# ─────────────────────────────────────────────────────────────────────────────

print("Generating ECDSA secp256k1 key pair...")
private_key = ec.generate_private_key(ec.SECP256K1())

subject = x509.Name([
    x509.NameAttribute(NameOID.COUNTRY_NAME,             COUNTRY),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME,        ORG_NAME),
    x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, BRANCH_NAME),
    x509.NameAttribute(NameOID.COMMON_NAME,              ORG_NAME),
    x509.NameAttribute(NameOID.SERIAL_NUMBER,            SERIAL_NUMBER,    _type=_ASN1Type.UTF8String),
    x509.NameAttribute(NameOID.USER_ID,                  VAT_NUMBER,       _type=_ASN1Type.UTF8String),
    x509.NameAttribute(NameOID.TITLE,                    BUSINESS_TYPE,    _type=_ASN1Type.UTF8String),
    x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME,   CITY,             _type=_ASN1Type.UTF8String),
    x509.NameAttribute(NameOID.BUSINESS_CATEGORY,        BUSINESS_CATEGORY,_type=_ASN1Type.UTF8String),
])

csr = (
    x509.CertificateSigningRequestBuilder()
    .subject_name(subject)
    .sign(private_key, hashes.SHA256())
)

# Write PEM files
key_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
)
csr_pem = csr.public_bytes(serialization.Encoding.PEM)

with open("zatca-private-key.pem", "wb") as f:
    f.write(key_pem)
with open("zatca-csr.pem", "wb") as f:
    f.write(csr_pem)

# Base64 DER for the API
csr_der    = csr.public_bytes(serialization.Encoding.DER)
csr_base64 = base64.b64encode(csr_der).decode()

key_der    = private_key.private_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
)
key_base64 = base64.b64encode(key_der).decode()

print("\nFiles written: zatca-private-key.pem, zatca-csr.pem")
print(f"\nSubject: C={COUNTRY}, O={ORG_NAME}, OU={BRANCH_NAME}, CN={ORG_NAME}")
print(f"         SN={SERIAL_NUMBER}")
print(f"         UID={VAT_NUMBER}, title={BUSINESS_TYPE}, businessCategory={BUSINESS_CATEGORY}")
print(f"         registeredAddress={CITY}")

print("\n=== CSR Base64 (paste as \"csr\" in POST /compliance) ===\n")
print(csr_base64)

print("\n=== Private Key Base64 (set as ZATCA_PRIVATE_KEY in .env) ===\n")
print(key_base64)
