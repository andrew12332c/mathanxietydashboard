# Variable Descriptions for Math Anxiety & AI Usage Study

## Overview
This document provides detailed descriptions of all variables used in the research dashboard.

---

## 📊 Primary Calculated Variables

### 1. **Trait Math Anxiety Score**
- **Variable Name**: `traitAnxiety`
- **Source Variables**: `w1mathax1` through `w1mathax9`
- **Calculation**: Mean of all 9 items
- **Scale**: 1-7 (1 = Low Anxiety, 7 = High Anxiety)
- **Type**: Continuous
- **Description**: A stable, long-term measure of a person's general fear or dislike of mathematics, regardless of the specific situation.
- **Example Items**: 
  - "I feel nervous about doing math"
  - "Math makes me uncomfortable"
  - "I worry about math class"

### 2. **State Anxiety Score**
- **Variable Name**: `stateAnxiety`
- **Source Variables**: 
  - `w3stress` - Current stress level
  - `w3stressmathp` - Math-specific stress
  - `w3stressamount` - Amount of stress
  - `w3stressunder` - Feeling overwhelmed
  - `w3stressscore` - Overall stress score
- **Calculation**: Sum of all 5 stress items
- **Scale**: Variable (sum of 5 items, typically 5-25)
- **Type**: Continuous
- **Description**: Measures "Right Now" anxiety - how the participant felt at the specific moment they were performing the math task. This is situational and can change based on context.

### 3. **Trust in AI Score**
- **Variable Name**: `trustInAI`
- **Source Variables**: `w1tsq1` through `w1tsq14`
- **Calculation**: Mean of all 14 trust items
- **Scale**: 1-7 (1 = Low Trust, 7 = High Trust)
- **Type**: Continuous
- **Description**: Measures student confidence in and trust of AI systems for learning support.
- **Example Items**:
  - "AI systems are reliable for learning"
  - "I trust AI to help me understand difficult concepts"
  - "AI provides accurate information"

### 4. **AI User Classification**
- **Variable Name**: `aiUser`
- **Source Variables**: `w1colmath1` through `w1colmath31`
- **Calculation**: Binary - TRUE if any collaborative math question was answered
- **Values**: 
  - `1` or `true` = AI User
  - `0` or `false` = Non-User
- **Type**: Categorical (Binary)
- **Description**: Identifies students who used AI as a tutor vs. those who did not.

### 5. **Anxiety Category**
- **Variable Name**: `anxietyCategory`
- **Source**: Derived from `traitAnxiety`
- **Calculation**: 
  - `low` if traitAnxiety ≤ 3.0
  - `high` if traitAnxiety > 3.0
- **Values**: `'low'` or `'high'`
- **Type**: Categorical
- **Description**: Binary classification of students into low vs. high baseline math anxiety groups.

### 6. **Math Performance Score**
- **Variable Name**: `mathScore`
- **Source Variable**: `mathscore`
- **Scale**: Typically 0-20 (varies by assessment)
- **Type**: Continuous
- **Description**: Final math performance score on the assessment administered to participants.

---

## 🔬 Research Framework

### Trait vs. State Anxiety
The study examines two types of anxiety:

1. **Trait (Stable)**
   - Describes the **Person**
   - Measured at baseline (Week 1)
   - Reflects long-term attitudes toward math
   - Used to categorize students into high/low anxiety groups

2. **State (Situational)**
   - Describes the **Situation**
   - Measured during task (Week 3)
   - Reflects "in the moment" stress
   - Used to assess AI's immediate impact

### Key Research Questions

1. **Does AI Reduce State Anxiety?**
   - Compare state anxiety between AI users and non-users
   - Control for trait anxiety levels
   - Hypothesis: AI tutoring reduces situational stress

2. **Do High-Anxiety Students Benefit More?**
   - Examine performance differences across anxiety groups
   - Test interaction effect: Anxiety × AI Usage
   - Hypothesis: AI has differential effects by baseline anxiety

3. **Trust and Adoption**
   - Relationship between math anxiety and AI trust
   - Prediction: Trust mediates AI usage and outcomes

---

## 📋 Raw Survey Variables

### Week 1 Survey Variables (Baseline)

#### Math Anxiety Items (w1mathax1-9)
| Variable | Description |
|----------|-------------|
| `w1mathax1` | "I find math interesting" (reverse scored) |
| `w1mathax2` | "Math makes me nervous" |
| `w1mathax3` | "I don't like math" |
| `w1mathax4` | "I worry about math" |
| `w1mathax5` | "Math is scary" |
| `w1mathax6` | "I avoid math when possible" |
| `w1mathax7` | "Math makes me uncomfortable" |
| `w1mathax8` | "I panic during math tests" |
| `w1mathax9` | "I feel tense about math" |

#### Trust in AI Items (w1tsq1-14)
Trust Survey Questions measuring confidence in AI systems for educational purposes.

#### Collaborative Math Items (w1colmath1-31)
Questions about using AI tools for math problem-solving and learning.

### Week 3 Survey Variables (During Task)

#### State Stress Items
| Variable | Description |
|----------|-------------|
| `w3stress` | Overall stress during task |
| `w3stressmathp` | Math-specific stress |
| `w3stressamount` | Amount of stress experienced |
| `w3stressunder` | Feeling overwhelmed |
| `w3stressscore` | Composite stress rating |

#### Mind Wandering Items
| Variable | Description |
|----------|-------------|
| `w3wander1` | Attention during task |
| `w3wander2` | Mind wandering frequency |
| `w3wander3` | Focus difficulty |
| `w3wander4` | Distraction level |

### Week 5 Survey & Performance Variables

#### Demographics
- `age` - Participant age
- `gendermale`, `genderfemal`, `gendernonbinary` - Gender identification
- `major` - Academic major
- `lvl` - Academic level (FR=Freshman, SO=Sophomore, JR=Junior, SR=Senior)

#### Performance
- `mathscore` - Final math assessment score

---

## 📈 Dashboard Visualizations

### Chart 1: Trait vs State Anxiety
- **X-axis**: Trait Anxiety (1-7)
- **Y-axis**: State Anxiety (sum score)
- **Points**: Individual students, colored by AI usage
- **Purpose**: Show relationship between baseline and situational anxiety

### Chart 2: AI Users vs Non-Users
- **Type**: Bar chart
- **Comparison**: Average state anxiety scores
- **Purpose**: Direct comparison of AI impact on anxiety

### Chart 3: Performance by AI & Anxiety
- **Type**: Grouped bar chart
- **Groups**: Low Anxiety, High Anxiety
- **Bars**: AI Users vs Non-Users
- **Purpose**: Examine interaction effects

### Chart 4: Trust in AI
- **X-axis**: Trait Math Anxiety
- **Y-axis**: Trust in AI Score
- **Purpose**: Understand adoption patterns

### Chart 5: Anxiety Distribution
- **Type**: Histogram
- **Purpose**: Show sample characteristics and distribution

### Chart 6: Interactive Scatter
- **X-axis**: Math Performance Score
- **Y-axis**: Trait Math Anxiety
- **Interactive**: Hover for individual details
- **Purpose**: Explore individual variation and outliers

---

## 🎯 Statistical Analyses

### Computed in Dashboard:

1. **Descriptive Statistics**
   - Means and standard deviations
   - Group sizes and proportions
   - Distribution characteristics

2. **Correlations**
   - Pearson correlation coefficients
   - Trait anxiety × State anxiety
   - Trust × Anxiety
   - Performance × Anxiety

3. **Group Comparisons**
   - AI Users vs Non-Users
   - High vs Low Anxiety
   - Percentage differences

4. **Automated Insights**
   - Dynamically calculated findings
   - Effect sizes (percent differences)
   - Relationship directions

---

## 🔍 Data Quality Notes

### Missing Data Handling
- Missing values excluded from calculations
- Per-variable exclusion (not listwise deletion)
- Sample sizes may vary across analyses

### Score Calculations
- Only computed when sufficient items available
- Trait Anxiety: Requires at least 1 of 9 items
- State Anxiety: Requires at least 1 of 5 items
- Trust in AI: Requires at least 1 of 14 items

### Outlier Treatment
- No automatic outlier removal
- Visual inspection enabled via scatter plots
- Researchers should verify extreme values

---

## 📚 References

For more information about these constructs:
- **Math Anxiety**: Richardson & Suinn (1972), Ashcraft (2002)
- **State-Trait Theory**: Spielberger (1983)
- **Trust in AI**: Shin (2021), Glikson & Woolley (2020)

---

## ⚙️ Technical Implementation Notes

### Data Processing Pipeline
1. Load CSV files via Papa Parse
2. Calculate composite scores
3. Create derived categories
4. Apply user-selected filters
5. Update all visualizations dynamically

### Performance Optimization
- Client-side processing (no server required)
- Efficient array operations
- Canvas-based rendering (Chart.js)
- SVG for interactive elements (D3.js)

---

**Last Updated**: February 2025
