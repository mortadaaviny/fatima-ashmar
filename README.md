# Fatima app: Supabase + Cloudflare setup (about 15 minutes)

## 1. Supabase project
1. supabase.com > New project. Save the database password.
2. SQL Editor > New query > paste **01-setup.sql** > Run. This creates the table, the private file bucket, login-only access and live sync.
3. Authentication > Providers > Email: keep it on, turn **off "Allow new users to sign up"**.
4. Authentication > Users > Add user > create one account per family member (email + password, tick "Auto confirm").
5. Project Settings > API: copy the **Project URL** and the **anon public key**.

## 2. Claude (analysis and chat)
1. Edge Functions > Deploy a new function > name it exactly `ai` > paste **02-ai-function.ts** > Deploy.
2. Edge Functions > Secrets > add `ANTHROPIC_API_KEY` (from console.anthropic.com).
   Optional: `AI_MODEL` (default `claude-sonnet-5-5`).

## 3. Website
1. Unzip **fatima-cloudflare.zip**, open `config.js`, paste the Project URL and anon key, save, zip the folder contents again (index.html must be at the top level).
   Or send me the two values and I will rebuild the zip for you.
2. dash.cloudflare.com > Workers & Pages > Create > Pages > **Upload assets** > name it (e.g. fatima-care) > drop the zip or folder > Deploy.
3. Open the `*.pages.dev` link, sign in, then use the install button to add it to the phone or computer.

## Notes
- Everything is protected by the login. Without an account nobody can read the data, the files, or call Claude.
- Patient profile and doctors' names are stored in the database (records: meta/ctx), not in the website code.
- Photos, PDFs and recordings are in the private `files` bucket, opened through long-lived signed links.
- Updating the site later: upload the new zip as a new deployment.
