# Math Anxiety & AI Usage Research Dashboard

An interactive web-based visualization dashboard exploring the relationship between math anxiety and AI tutoring usage among university students.

**Live Demo:** `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## About This Research

This dashboard visualizes data from a research study examining:
- The relationship between trait (baseline) and state (situational) math anxiety
- How students with different anxiety levels use AI tutoring systems
- Gender differences in math anxiety
- The correlation between math anxiety and academic performance
- Student trust in AI-based learning tools

**Researcher:** Andrew Zhang  
**Lab:** [ETC Lab](https://www.etclab.info/) at UC Irvine  
**Presented at:** [UCI Undergraduate Research Symposium](https://uciurop.infoready4.com/#learnMore/29117)

---

## Features

### Interactive Visualizations
- **Trait vs State Anxiety Scatter Plot** with regression line showing correlation
- **Math Anxiety by Academic Level** comparing Freshman through Senior years
- **State Anxiety Distribution** histogram showing task-specific stress patterns
- **Trust in AI Analysis** exploring relationship with math anxiety
- **Trait Anxiety Distribution** showing overall sample characteristics
- **Interactive D3 Scatter Plot** with hover details (Math Score vs Anxiety by Gender)

### Dynamic Filtering
- Filter by anxiety level (Low/High)
- Filter by gender (Female/Male/Other)
- Real-time chart updates

### Statistical Insights
10 automatically calculated findings including:
- Correlation coefficients (Pearson's r)
- T-test statistics with p-values
- Effect sizes (Cohen's d)
- R² values showing variance explained
- Distribution statistics (mean, SD, skewness)

---

## Technologies Used

- **HTML5/CSS3** - Structure and responsive design
- **JavaScript ES6** - Data processing and interactivity
- **Chart.js** - Interactive chart visualizations
- **D3.js v7** - Advanced scatter plot with hover tooltips
- **Papa Parse** - CSV data parsing

---

## Dataset Variables

### Key Metrics
- **Trait Anxiety Score**: Mean of 9 math anxiety items (1-7 scale)
- **State Anxiety Score**: Sum of 5 stress items during math task
- **Trust in AI Score**: Mean of 14 trust survey items (1-7 scale)
- **Math Performance**: Score on assessment (0-20 scale)

### Demographics
- Gender (Female/Male/Other)
- Academic Level (FR/SO/JR/SR)
- Age

For detailed variable descriptions, see [VARIABLES.md](VARIABLES.md)

---

## Quick Start

### View Online
Simply visit the live dashboard URL (once deployed via GitHub Pages)

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

2. Start a local web server:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

3. Open browser to `http://localhost:8000`

---

## Project Structure

```
.
├── index.html              # Main dashboard page
├── styles.css              # Styling and responsive design
├── script.js               # Data processing and visualizations
├── data/                   # CSV data files
│   ├── combined_output.csv
│   ├── sp25mathanxietyw3survey.csv
│   └── sp25w5survey-and-mathscores.csv
├── README.md               # This file
├── VARIABLES.md            # Detailed variable descriptions
└── QUICK_START.md          # Getting started guide
```

---

## Research Questions Addressed

1. **Does baseline math anxiety predict task-specific anxiety?**
   - Examined via correlation analysis and regression

2. **Are there gender differences in math anxiety?**
   - Compared via t-tests and effect size calculations

3. **Does math anxiety impact performance?**
   - Analyzed through correlation and group comparisons

4. **How do students trust AI tutoring systems?**
   - Explored relationship with anxiety levels

5. **Does anxiety change across academic years?**
   - Tracked from Freshman to Senior year

---

## Statistical Methods

- **Pearson Correlation** - Relationship strength between variables
- **Welch's T-Test** - Group comparisons with unequal variances
- **Linear Regression** - Trend line analysis
- **Cohen's D** - Standardized effect sizes
- **Descriptive Statistics** - Mean, SD, skewness, coefficient of variation

---

## Academic Context

This dashboard is part of a larger research study conducted in the [Education, Technology & Culture Lab (ETC Lab)](https://www.etclab.info/) at UC Irvine. The lab investigates how technology-centered learning affects student attitudes and behaviors, with a focus on AI tutoring systems and online learning platforms.

---

## Citation

If you use this dashboard or data in your research, please cite:

```
Zhang, A. (2025). Math Anxiety & AI Usage Research Dashboard. 
UC Irvine Undergraduate Research Symposium. 
https://github.com/YOUR-USERNAME/YOUR-REPO-NAME
```

---

## Data Privacy

⚠️ **Note:** Student IDs and personally identifiable information have been removed from the public dataset to protect participant privacy.

---

## Contributing

This is a research project dashboard. For questions or collaborations, please contact through:
- [LinkedIn](https://www.linkedin.com/in/andrew-zhanger/)
- ETC Lab website

---

## License

This project is created for academic research purposes. Data and code are shared for educational and research use.

---

## Acknowledgments

- **ETC Lab** - Research support and guidance
- **UC Irvine** - Research infrastructure
- **UCI Undergraduate Research Opportunities Program (UROP)** - Symposium opportunity
- Study participants who contributed their data

---

## Future Enhancements

- [ ] Add download functionality for filtered data
- [ ] Implement additional statistical tests (ANOVA, regression models)
- [ ] Include longitudinal analysis across multiple time points
- [ ] Add comparison with control groups
- [ ] Integrate machine learning predictions

---

**For questions about the research methodology or findings, please refer to the full research paper or contact the ETC Lab.**

---

Made with ❤️ by Andrew Zhang | [ETC Lab @ UC Irvine](https://www.etclab.info/)
