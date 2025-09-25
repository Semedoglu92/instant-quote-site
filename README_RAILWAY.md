Deploying to Railway
===================

Quick steps (GitHub + Railway web UI):

1. Push your repo to GitHub (or ensure it's already on GitHub).
2. On Railway (app.railway.app) create a new project and choose "Deploy from GitHub".
3. Connect the repo `instant-quote-site` and choose the `main` branch.
4. Railway will detect the project. Use the Dockerfile option or let Railway build from `package.json`.
5. Add the following environment variables in Railway Settings → Variables:
   - PORT = 3000
   - N8N_URL = https://instantrepair.up.railway.app/webhook-test/quote  # your n8n webhook
   - OPENAI_API_KEY = (optional) your OpenAI key if you want real LLM responses

6. Deploy. Railway will build the Docker image and start the `web` process (Procfile contains `web: node server.js`).

CLI alternative
---------------
If you prefer the Railway CLI, run these from your project folder:

```bash
railway init       # create a Railway project (or link to an existing one)
railway up         # deploy
```

Troubleshooting
---------------
- If Railway shows health failures, check `docker logs` in Railway's UI or fetch logs via the Railway dashboard.
- Ensure `N8N_URL` and `OPENAI_API_KEY` are set correctly in Railway's environment variables. Don't commit secrets to git.

That's it — once deployed, your site will be reachable at the Railway-provided domain and will forward /quote requests to your `N8N_URL` if it's configured.
