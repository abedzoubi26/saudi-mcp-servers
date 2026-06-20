#!/bin/bash
# Generate an ECDSA P-256 private key + ZATCA-compliant CSR using OpenSSL.
# ZATCA requires ECDSA P-256 (prime256v1) — RSA is rejected.
#
# Usage: bash generate-csr-openssl.sh
set -e

# ── Configuration ────────────────────────────────────────────────────────────
VAT_NUMBER="310712587200003"
ORG_NAME="Tahawwul Telecom and IT Company"
BRANCH_NAME="Main Branch"
SERIAL_NUMBER="1-Tahawwul|2-EGS1-001|3-MCP"   # SN: 1-name|2-serial|3-solution
CITY="Riyadh"
COUNTRY="SA"
BUSINESS_TYPE="1100"        # 1100=B2B+B2C, 0100=B2B only, 1000=B2C only
BUSINESS_CATEGORY="Technology"
# ─────────────────────────────────────────────────────────────────────────────

KEY_FILE="zatca-private-key.pem"
CSR_FILE="zatca-csr.pem"
CNF_FILE="zatca-csr.cnf"

cat > "$CNF_FILE" <<EOF
[ req ]
prompt              = no
default_md          = sha256
distinguished_name  = dn
req_extensions      = req_ext
string_mask         = utf8only

# Teach OpenSSL about OIDs it might not know
oid_section = extra_oids

[ extra_oids ]
registeredAddress = 2.5.4.26

[ dn ]
C                    = ${COUNTRY}
O                    = ${ORG_NAME}
OU                   = ${BRANCH_NAME}
CN                   = ${ORG_NAME}
serialNumber         = UTF8:${SERIAL_NUMBER}
UID                  = ${VAT_NUMBER}
title                = ${BUSINESS_TYPE}
businessCategory     = ${BUSINESS_CATEGORY}
registeredAddress    = ${CITY}

[ req_ext ]
subjectKeyIdentifier = hash
EOF

echo "Generating ECDSA P-256 private key..."
openssl ecparam -name prime256v1 -genkey -noout -out "$KEY_FILE"

echo "Generating CSR..."
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -config "$CNF_FILE"

echo ""
echo "Verifying CSR subject..."
openssl req -in "$CSR_FILE" -noout -subject -text | grep -E "Subject:|serialNumber|UID|title|businessCategory|registeredAddress"

# Base64 DER — single line, for the API
CSR_BASE64=$(openssl req -in "$CSR_FILE" -outform DER | base64 | tr -d '\n')
KEY_BASE64=$(openssl ec -in "$KEY_FILE" -outform DER 2>/dev/null | base64 | tr -d '\n')

echo ""
echo "=== CSR Base64 (paste as \"csr\" in POST /compliance) ==="
echo ""
echo "$CSR_BASE64"
echo ""
echo "=== Private Key Base64 (set as ZATCA_PRIVATE_KEY in .env) ==="
echo ""
echo "$KEY_BASE64"
echo ""
echo "Files: $KEY_FILE  $CSR_FILE"

rm -f "$CNF_FILE"
