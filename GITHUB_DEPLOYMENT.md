# How to Host Your Dashboard on GitHub Pages (FREE)

This guide will help you deploy your Math Anxiety & AI Usage Dashboard to GitHub Pages for free hosting.

---

## Prerequisites

- GitHub account (free) - [Sign up here](https://github.com/signup)
- Git installed on your computer - [Download here](https://git-scm.com/downloads)

---

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in top-right corner → **"New repository"**
3. Name your repository (e.g., `math-anxiety-dashboard`)
4. Make it **Public** (required for free GitHub Pages)
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

---

## Step 2: Prepare Your Files

Make sure your project structure looks like this:

```
10197546/
├── index.html
├── styles.css
├── script.js
├── data/
│   ├── combined_output.csv
│   ├── sp25mathanxietyw3survey.csv
│   └── sp25w5survey-and-mathscores.csv
├── README.md
└── .gitignore (create this)
```

### Create a `.gitignore` file:

Create a new file called `.gitignore` in your project folder with this content:

```
# OS Files
.DS_Store
Thumbs.db

# R Project Files
.Rproj.user
.Rhistory
*.Rproj

# Temporary files
*.tmp
*.log

# Server files
start_server.bat
start_server.ps1

# Documentation (optional - remove if you want to include them)
QUICK_START.md
VARIABLES.md
GITHUB_DEPLOYMENT.md
setup_check.html
```

---

## Step 3: Initialize Git and Push to GitHub

Open **Command Prompt** or **PowerShell** in your project folder:

```bash
# Navigate to your project folder
cd C:\Users\AZNew\Downloads\10197546\10197546

# Initialize git repository
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Math Anxiety Dashboard"

# Add your GitHub repository as remote (replace USERNAME and REPO-NAME)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace:**
- `USERNAME` with your GitHub username
- `REPO-NAME` with your repository name (e.g., `math-anxiety-dashboard`)

---

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top-right area)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

---

## Step 5: Access Your Live Dashboard

Your dashboard will be live at:

```
https://USERNAME.github.io/REPO-NAME/
```

For example:
- If your GitHub username is `andrew-zhang`
- And your repo is `math-anxiety-dashboard`
- Your URL will be: `https://andrew-zhang.github.io/math-anxiety-dashboard/`

---

## Updating Your Dashboard

Whenever you make changes:

```bash
# Make your changes to files
# Then commit and push:

git add .
git commit -m "Description of your changes"
git push
```

Changes will appear on your live site in 1-2 minutes.

---

## Important Notes

### Data Privacy

⚠️ **WARNING**: Your CSV data files will be publicly accessible on GitHub!

If your data contains **sensitive information** (student IDs, personal info):

**Option A: Remove Identifiable Data**
- Remove or anonymize the `rid` column
- Remove any columns with names or emails
- Keep only aggregated/anonymous data

**Option B: Use Private Repository** (Requires GitHub Pro)
- GitHub Pages for private repos requires paid plan
- Consider UCI's institutional GitHub if available

**Option C: Host Data Separately**
- Keep data files private
- Host dashboard on GitHub Pages
- Load data from a secure UCI server

### Recommended: Anonymize Data Before Publishing

```bash
# Don't add data files to git
echo "data/*.csv" >> .gitignore

# Then create anonymized versions
# (manually remove identifying columns from CSVs)
```

---

## Alternative: GitHub Desktop (Easier Method)

If you prefer a GUI instead of command line:

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in to GitHub
3. Click **"Add"** → **"Add existing repository"**
4. Select your project folder
5. Click **"Publish repository"**
6. Follow Step 4 above to enable GitHub Pages

---

## Troubleshooting

### Dashboard shows blank page
- Check browser console (F12) for errors
- Ensure all file paths are correct (case-sensitive on GitHub!)
- Verify CSV files are in the `data/` folder

### Charts not loading
- Check that CSV files are present in repository
- Verify file names match exactly (including capitalization)
- Look for CORS errors in browser console

### 404 Error
- Wait a few minutes after enabling GitHub Pages
- Check the repository name in your URL
- Ensure the repository is Public

### Need to update data
```bash
# Update your CSV files locally
# Then:
git add data/*.csv
git commit -m "Update data files"
git push
```

---

## Custom Domain (Optional)

To use a custom domain like `mathresearch.yourdomain.com`:

1. Buy a domain from Namecheap, Google Domains, etc.
2. In your repo, create a file called `CNAME` with your domain
3. Add DNS records at your domain registrar pointing to GitHub Pages
4. Instructions: [GitHub Custom Domain Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## Sharing Your Dashboard

Once live, you can share:
- In your research symposium presentation
- On your LinkedIn profile
- In your CV/resume
- With the ETC Lab team
- With professors and collaborators

---

## Example Commands Summary

```bash
# One-time setup
cd C:\Users\AZNew\Downloads\10197546\10197546
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main

# Future updates
git add .
git commit -m "Update description"
git push
```

---

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Git Basics Tutorial](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Desktop Guide](https://docs.github.com/en/desktop)

---

**Congratulations! Your dashboard is now live and shareable worldwide!** 🎉

Remember to add the GitHub Pages URL to your symposium poster/presentation!
