#!/bin/bash
# Generate an ECDSA private key + ZATCA-compliant CSR.
# Usage: bash generate-csr.sh
#
# Required inputs (prompted):
#   VAT_NUMBER       15-digit VAT registration number
#   COMPANY_NAME     Commercial name (Arabic or English)
#   BRANCH_NAME      Branch or unit name
#   CITY             City name
#   EGS_SERIAL       Unique identifier for this EGS unit (e.g. "EGS1-ACME-001")

set -e

echo "=== ZATCA CSR Generator ==="
echo ""
read -p "VAT Number (15 digits):       " VAT_NUMBER
read -p "Company name:                  " COMPANY_NAME
read -p "Branch / unit name:            " BRANCH_NAME
read -p "City:                          " CITY
read -p "EGS serial (e.g. EGS1-Co-001): " EGS_SERIAL

# Output files
KEY_FILE="zatca-private-key.pem"
CSR_FILE="zatca-csr.pem"
CNF_FILE="zatca-csr.cnf"

# Build OpenSSL config with ZATCA-required fields
cat > "$CNF_FILE" <<EOF
[ req ]
default_bits        = 2048
prompt              = no
default_md          = sha256
distinguished_name  = dn
req_extensions      = req_ext

[ dn ]
C  = SA
O  = ${VAT_NUMBER}
OU = ${BRANCH_NAME}
CN = ${EGS_SERIAL}

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
# ZATCA required OIDs
# 2.16.840.1.114412.1.1 = EGS Serial Number
# 2.16.840.1.114412.1.2 = VAT Registration Number
# Using URI SANs as ZATCA accepts these for the sandbox
URI.1 = ${EGS_SERIAL}
URI.2 = ${VAT_NUMBER}
EOF

# Generate ECDSA private key (prime256v1 = P-256, required by ZATCA)
echo ""
echo "Generating ECDSA P-256 private key..."
openssl ecparam -name prime256v1 -genkey -noout -out "$KEY_FILE"

# Generate CSR
echo "Generating CSR..."
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -config "$CNF_FILE"

# Encode CSR to base64 (single line, for the API)
CSR_BASE64=$(openssl req -in "$CSR_FILE" -outform DER | base64 | tr -d '\n')

echo ""
echo "=== Done ==="
echo ""
echo "Files created:"
echo "  Private key : $KEY_FILE   ← keep this secret, never share"
echo "  CSR         : $CSR_FILE"
echo "  Config      : $CNF_FILE   (safe to delete)"
echo ""
echo "=== Base64 CSR (paste into zatca_request_compliance_csid) ==="
echo ""
echo "$CSR_BASE64"
echo ""
echo "=== Private key (base64, set as ZATCA_PRIVATE_KEY env var) ==="
echo ""
openssl ec -in "$KEY_FILE" -outform DER 2>/dev/null | base64 | tr -d '\n'
echo ""

# Clean up config
rm -f "$CNF_FILE"
