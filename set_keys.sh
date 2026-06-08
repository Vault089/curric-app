#!/bin/bash
echo "Paste your ANON key (the long eyJ... one):"
read -r ANON
echo "Paste your SERVICE ROLE key (the other long eyJ... one):"
read -r SERVICE

cat > /mnt/f/curric-app/.env.local << EOF
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://qfccyyrnjwfozpznnsjh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON
SUPABASE_SERVICE_ROLE_KEY=$SERVICE

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=***
EOF

echo "Done! Checking..."
wc -c /mnt/f/curric-app/.env.local
