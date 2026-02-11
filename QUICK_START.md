# 🚀 Quick Start Guide

## Get Your Dashboard Running in 3 Steps!

### Step 1: Verify Setup ✅

Open `setup_check.html` in your browser to verify all files are in place:
```
Right-click setup_check.html → Open with → Your Browser
```

This will check:
- ✓ Core files (HTML, CSS, JS)
- ✓ Data files (all 3 CSV files)
- ✓ External libraries

---

### Step 2: Start the Server 🌐

**Choose ONE method:**

#### Method A: Windows Batch File (Easiest)
```
Double-click: start_server.bat
```

#### Method B: PowerShell Script
```
Right-click start_server.ps1 → Run with PowerShell
```

#### Method C: Command Line
```bash
# Open Command Prompt or PowerShell in this folder
cd C:\Users\AZNew\Downloads\10197546\10197546
python -m http.server 8000
```

#### Method D: No Server (Quick Test)
```
Just double-click index.html
Note: Some features may not work due to browser security
```

---

### Step 3: Open Dashboard 🎯

Once server is running:
1. Open your browser
2. Go to: **http://localhost:8000**
3. Start exploring!

---

## 🎨 What You'll See

### Main Features:
1. **📊 Statistics Panel** - Key metrics at a glance
2. **🎛️ Interactive Filters** - Control what data you see
3. **📈 6 Visualizations** - Charts and graphs
4. **💡 Automated Insights** - AI-generated findings

### Interactive Controls:
- **Anxiety Level Filter**: Focus on high or low anxiety students
- **AI Usage Filter**: Compare users vs non-users
- **Hover on Charts**: See detailed tooltips
- **D3 Scatter Plot**: Hover on dots for student details

---

## 🔧 Troubleshooting

### Charts Not Showing?
- ✅ Make sure you're using a web server (not opening as file://)
- ✅ Check browser console (F12) for errors
- ✅ Verify all data files are in `data/` folder

### Server Won't Start?
- ✅ Install Python from https://www.python.org/
- ✅ Check if port 8000 is already in use
- ✅ Try a different port: `python -m http.server 8080`

### No Data Showing?
- ✅ Ensure CSV files are in correct location
- ✅ Check file names match exactly
- ✅ Open browser console to see error messages

### CORS Errors?
This means you're trying to open as a file. Solutions:
1. Use one of the server methods above
2. OR use a browser extension to disable CORS (development only!)

---

## 📊 Understanding Your Dashboard

### Key Visualizations Explained:

1. **Trait vs State Anxiety**
   - Shows relationship between baseline anxiety and task anxiety
   - Blue dots = AI users, Orange = non-users
   - Look for: Do AI users cluster differently?

2. **AI Comparison Bar Chart**
   - Direct comparison of anxiety levels
   - Lower bar = less anxiety = better
   - Look for: Significant difference between groups?

3. **Performance Chart**
   - Grouped by anxiety level and AI usage
   - Taller bar = better performance
   - Look for: Does AI help more for high-anxiety students?

4. **Trust in AI Scatter**
   - Each dot is a student
   - Upward trend = more anxiety → more trust
   - Downward trend = more anxiety → less trust

5. **Distribution Histogram**
   - Shows how many students at each anxiety level
   - Most common level = tallest bar
   - Look for: Is the sample mostly anxious or not?

6. **Interactive Scatter Plot**
   - Hover over any dot for full details
   - X-axis = performance, Y-axis = anxiety
   - Look for: Outliers, patterns, individual stories

---

## 🎯 Research Questions to Explore

Use the dashboard to answer:

### Question 1: Does AI reduce anxiety?
1. Look at **Chart 2** (AI Comparison)
2. Check the **Insights Panel**
3. Use filters to focus on specific groups

### Question 2: Who benefits from AI?
1. Look at **Chart 3** (Performance)
2. Compare high vs low anxiety groups
3. See if there's an interaction effect

### Question 3: Do anxious students trust AI?
1. Look at **Chart 4** (Trust)
2. Check for correlation pattern
3. Read the automated insight

### Question 4: Is trait = state?
1. Look at **Chart 1** (Trait vs State)
2. Perfect correlation = diagonal line
3. Lots of scatter = they differ

---

## 🎓 Tips for Presentations

### For Academic Presentations:
1. Start with the **Statistics Panel** - establishes sample
2. Show **Distribution** - describes your population
3. Present **main findings** - Charts 2 & 3
4. Discuss **mechanisms** - Charts 1 & 4
5. End with **Insights Panel** - summarizes takeaways

### For Interactive Demos:
1. Open with filters at default (show all data)
2. Use **anxiety filter** - dramatic differences
3. Use **AI filter** - isolate effects
4. Hover on **scatter plot** - tell individual stories
5. **Reset** and show how it updates live

### For Reports:
- Take screenshots of key charts
- Export insights from the Insights Panel
- Note sample sizes for each comparison
- Report correlation coefficients

---

## 📱 Mobile/Tablet Use

The dashboard is responsive but works best on desktop:
- **Desktop**: Full experience ✅
- **Tablet**: Good, some crowding ⚠️
- **Mobile**: Usable but cramped ⚠️

For presentations, use desktop or connect laptop to projector.

---

## 🔄 Updating Data

To use with new data:
1. Replace CSV files in `data/` folder
2. Keep same column names
3. Refresh dashboard (Ctrl+R or Cmd+R)
4. Charts update automatically!

---

## 📞 Need Help?

### Check These First:
1. **README.md** - Full documentation
2. **VARIABLES.md** - Variable descriptions
3. **Browser Console** (F12) - Error messages
4. **setup_check.html** - Verify installation

### Common Issues:

| Problem | Solution |
|---------|----------|
| Blank page | Use web server, not file:// |
| No charts | Check data files exist |
| Wrong data | Verify column names match |
| Slow loading | Normal for large datasets |

---

## 🎉 You're Ready!

Your dashboard is a powerful tool for exploring the relationship between math anxiety and AI usage. 

**Happy analyzing!** 📊

---

### Next Steps:
1. ✅ Run `setup_check.html`
2. ✅ Start server with `start_server.bat`
3. ✅ Open http://localhost:8000
4. ✅ Explore your data!
5. ✅ Share insights with your team!

---

**Pro Tip**: Bookmark http://localhost:8000 while developing, and keep the server running in the background!
