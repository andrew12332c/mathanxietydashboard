# GitHub Pages Troubleshooting – Math Anxiety Dashboard

Your site should be at: **https://andrew12332c.github.io/mathanxietydashboard/**

If it "no longer works," check the following in order.

---

## 1. Repo and URL

- **Repo URL:** https://github.com/andrew12332c/mathanxietydashboard  
- Open that link **while logged into GitHub**.  
  - If you get **404**: the repo may be missing, renamed, or private.  
  - **Fix:** Create the repo (same name), or make it **Public**, or update your local `git remote` if you renamed it.

---

## 2. GitHub Pages is enabled and correct

1. On GitHub: **Repo → Settings → Pages** (left sidebar).
2. Under **Build and deployment**:
   - **Source:** Deploy from a branch  
   - **Branch:** `main` (or whichever branch has your files)  
   - **Folder:** `/ (root)`  
3. Click **Save**.
4. Wait **1–5 minutes** and reload:  
   **https://andrew12332c.github.io/mathanxietydashboard/**

If you use a different branch (e.g. `master`), choose that branch and ensure `index.html` is at the repo root.

---

## 3. Right branch and files pushed

Your site is built from the **branch** and **folder** chosen in Settings → Pages. The repo root must contain:

- `index.html`
- `styles.css`
- `script.js`
- `data/` (with `combined_anonymized.csv` and/or `combined_output.csv`)

From your project folder:

```powershell
cd "C:\Users\andre\OneDrive\Documents\acelab dashboard\mathanxietydashboard"
git branch
git status
```

- If the default branch is not `main`, either switch to `main` and push there, or change Pages to use your current branch.
- If you see uncommitted or unpushed changes, commit and push:

```powershell
git add .
git commit -m "Update dashboard for GitHub Pages"
git push -u origin main
```

---

## 4. Blank or broken page (charts/data missing)

- Open the live URL, then **F12 → Console**.
- If you see **404** for `data/combined_anonymized.csv` or `data/combined_output.csv`:
  - Ensure the `data/` folder and those CSV files are committed and pushed (not in `.gitignore`).
- If you see **CORS** or **blocked** errors:
  - Use the **exact** Pages URL (with trailing slash):  
    `https://andrew12332c.github.io/mathanxietydashboard/`
  - Avoid opening `index.html` from a `file://` URL when testing “like GitHub Pages.”

The dashboard uses **relative** paths (`data/...`, `styles.css`, `script.js`), so they work on Pages as long as the repo structure above is correct.

---

## 5. Repo was recreated or renamed

If you recreated the repo or changed its name:

```powershell
git remote set-url origin https://github.com/andrew12332c/NEW-REPO-NAME.git
git push -u origin main
```

Then set **Pages** again in **Settings → Pages** for the new repo.

---

## 6. Checklist summary

| Check | Action |
|-------|--------|
| Repo exists and is public | Open repo URL in browser (logged in) |
| Pages source | Settings → Pages → Branch: `main`, Folder: `/ (root)` |
| Files on GitHub | Repo root has `index.html`, `styles.css`, `script.js`, `data/` |
| Correct URL | https://andrew12332c.github.io/mathanxietydashboard/ |
| After changes | Wait 1–5 min and hard refresh (Ctrl+F5) |

---

## Quick test locally (same structure as Pages)

From the project folder:

```powershell
cd "C:\Users\andre\OneDrive\Documents\acelab dashboard\mathanxietydashboard"
python -m http.server 8080
```

Then open: **http://localhost:8080/**  
If the dashboard and data load there, the same files should work on GitHub Pages once the repo and Pages settings are correct.
