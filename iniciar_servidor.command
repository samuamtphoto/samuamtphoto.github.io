#!/bin/bash
cd "$(dirname "$0")"
echo "Abriendo servidor local..."
open "http://localhost:8080/smvisuals_portfolio_v18_1.html"
python3 -m http.server 8080
