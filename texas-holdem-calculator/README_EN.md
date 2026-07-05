<p align="center">
  <img src="https://raw.githubusercontent.com/kfat77/texas-holdem-calculator/main/assets/logo.svg" width="120" alt="♠ Texas Hold'em Learning Assistant" onerror="this.style.display='none'">
</p>

<h1 align="center">♠ Texas Hold'em Learning Assistant ♥</h1>

<p align="center">
  <b>Gamified Learning · Probability Calculation · Bankroll Management · Preflop Strategy · Pure Frontend · Offline Ready</b>
</p>

<p align="center">
  <a href="https://kfat77.github.io/texas-holdem-calculator/">
    <img src="https://img.shields.io/badge/🔗-Live Demo-success?style=for-the-badge&logo=github" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/📱-PWA Supported-orange?style=for-the-badge" alt="PWA">
  <img src="https://img.shields.io/badge/⚡-Zero Dependencies-blue?style=for-the-badge" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/💰-BRM+Kelly-purple?style=for-the-badge" alt="BRM+Kelly">
</p>

<p align="center">
  🇨🇳 <a href="./README.md">中文</a> | 🇺🇸 <b>English</b>
</p>

---

## 🎯 Introduction

A **gamified Texas Hold'em learning app** that helps players improve their real-time decision-making in a more intuitive and engaging way. Through equity calculation, visual card selection, a 13×13 preflop matrix, and an AI coach, you can quickly build preflop strategies, evaluate hand strength, and receive targeted practice advice.

The app supports installation to your phone's home screen and works offline, enabling learning anytime, anywhere.

> All calculations are performed **locally in your browser** — no data is uploaded, and it works offline.

---

## ✨ Features

| Feature | Description | Status |
|:---:|:---|:---:|
| 📊 **Equity Calculator** | Visual card selection interface with real-time hand equity display to evaluate different decisions | ✅ Live |
| 💰 **Bankroll Management** | Action recommendations based on BRM + Kelly + RoR + EV to avoid going broke | ✅ Live |
| 🎯 **13×13 Preflop Hand Matrix** | Recommended actions for each hand by position, establishing standardized preflop strategy | ✅ Live |
| 🤖 **AI Coach Chat** | Chat with an intelligent coach to get strategy advice, review tips, and personalized practice plans | ✅ Live |
| 📱 **PWA Install** | Install as a native app on iOS/Android/Desktop with full offline functionality | ✅ Live |
| 🌐 **Bilingual** | One-click switch between Chinese/English, language preference auto-saved | ✅ Live |

---

## 🚀 Live Demo

👉 **[https://kfat77.github.io/texas-holdem-calculator/](https://kfat77.github.io/texas-holdem-calculator/)**

- ✅ Open directly on desktop / mobile / tablet browsers
- ✅ No download, no registration, no backend required
- ✅ Add to home screen for full offline use (PWA)
- ✅ Green felt table UI with Tesla-inspired minimalist layout

**Local Use**: Download the project → Double-click `index.html` → Open in browser

---

## 📱 Install to Home Screen

<details>
<summary><b>iPhone / iPad (Safari)</b></summary>

1. Open the live URL in Safari
2. Tap the **Share button** ⬆️ at the bottom
3. Select "**Add to Home Screen**"
4. The ♠ icon appears on your desktop — tap for full-screen use

</details>

<details>
<summary><b>Android (Chrome)</b></summary>

1. Open the live URL in Chrome
2. Tap menu **⋮** → "**Add to Home Screen**"
3. The icon appears on your desktop — use like a native app

</details>

---

## 📊 Module 1: Equity Calculator

### Visual Card Selection (Two-Step Selection)

```
┌─────────────────────────────────────────┐
│  ♠Spades ♥Hearts ♣Clubs ♦Diamonds      │  ← ① Select a suit first
├─────────────────────────────────────────┤
│  A  K  Q  J  10  9  8  7  6  5  4  3  2 │  ← ② Then select a rank
└─────────────────────────────────────────┘
```

- **Select Suit**: Tap one of the 4 suit buttons
- **Select Rank**: Tap one of the 13 rank buttons
- **Auto-Combine**: Suit + Rank = One card, automatically filled into the selected area
- **Undo**: Tap "↩️ Undo" to delete the last card, or tap an already selected card to remove it

### Four-Stage Calculation Flow

| Stage | Your Hand | Community Cards | Description |
|:---:|:---:|:---:|:---|
| **Pre-flop** | 2 cards | 0 cards | Only hole cards, waiting for the flop |
| **Flop** | 2 cards | 3 cards | Flop round, three community cards revealed |
| **Turn** | 2 cards | 4 cards | Turn round, four community cards revealed |
| **River** | 2 cards | 5 cards | River round, all five community cards revealed |

### Calculation Method

| Stage | Unknown Cards Remaining | Calculation Method | Accuracy |
|:---|:---:|:---|:---:|
| Pre-flop | 50 cards | Monte Carlo Simulation (200,000 samples) | Approximate |
| Flop | 47 cards | Exact Enumeration (C(47,2)=1,081 combinations) | Exact |
| Turn | 46 cards | Exact Enumeration (46 combinations) | Exact |
| River | 45 cards | Direct final hand evaluation | Deterministic |

### Theoretical Hand Probability Reference (Fully Random 7 Cards)

| Hand | Theoretical Probability | Approx. Frequency |
|:---|:---:|:---|
| One Pair | 43.82% | Every 2 hands |
| Two Pair | 23.50% | Every 4 hands |
| Three of a Kind | 4.83% | Every 21 hands |
| Straight | 4.62% | Every 22 hands |
| Flush | 3.03% | Every 33 hands |
| Full House | 2.60% | Every 38 hands |
| Four of a Kind | 0.168% | Every 595 hands |

> ⚠️ Actual probabilities vary significantly based on **your specific starting hand**. A pocket pair hitting a set is far more likely than the random average!

---

## 💰 Module 2: Bankroll Management Advice

Based on four major theories — **Bankroll Management (BRM)**, **Kelly Criterion**, **Risk of Ruin (RoR)**, and **Expected Value (EV)** — providing mathematical support for every decision you make.

### Required Inputs

| Input | Description | Example |
|:---|:---|:---:|
| 💵 Current Bankroll | Your total available funds | 2000 |
| 🎫 Buy-in Amount | One buy-in unit at your current level | 100 |
| 🏦 Current Pot | Chips already accumulated on the table | 150 |
| 📥 Amount to Call | The bet you need to match to continue | 50 |

### Auto-Calculated Metrics

| Metric | Theory Source | Description |
|:---|:---|:---|
| **Equity** | Monte Carlo Simulation | Your hand vs. random opponent hand, 5,000 simulations |
| **EV** | EV = (Equity × Win) − ((1−Equity) × Loss) | Positive = long-term profit; Negative = long-term loss |
| **Pot Odds** | Pot Odds = Call Amount / (Pot + Call Amount) | Determines if calling is "mathematically correct" |
| **Kelly Ratio** | f* = (bp − q) / b | Optimal bankroll betting proportion |
| **Half-Kelly ⭐** | Kelly / 2 | **Recommended strategy** — reduces variance, more robust long-term |
| **Risk of Ruin (RoR)** | R = ((1−edge)/(1+edge))^buyIns | Probability of going broke at your current level |
| **BRM Status** | Cash Game: 20–50 buy-ins is healthy | Evaluates safety level based on bankroll/buy-in ratio |

### Action Recommendation Output

The system synthesizes all metrics above to provide clear recommendations:

- 🟥 **FOLD** — Negative EV or unfavorable odds
- 🟦 **CALL** — Marginal positive EV, control the pot
- 🟩 **RAISE** — Strong hand, extract value
- 🟪 **ALL-IN** — Premium hand, maximize expected value

> When bankroll is tight (<20 buy-ins), the system automatically **reduces aggression** and warns you to protect your funds.

---

## 🎯 Module 3: 13×13 Preflop Hand Matrix

The most fundamental skill in Texas Hold'em — **preflop starting hand ranges**. The 13×13 matrix covers all 169 starting hand combinations, with recommended actions by position:

| Position | Description |
|:---|:---|
| **UTG (Under the Gun)** | First to act, tightest range, only premium hands |
| **MP (Middle Position)** | Middle position, moderate range |
| **CO (Cutoff)** | Second-to-last to act, can play more hands |
| **BTN (Button)** | Last to act, biggest positional advantage, widest range |
| **SB (Small Blind)** | Already invested half a bet, slightly wider than UTG |
| **BB (Big Blind)** | Already invested one bet, must defend a wider range |

### Matrix Color Legend

| Color | Meaning | Action |
|:---:|:---|:---|
| 🟩 Green | Strong / Premium hands | **Raise / 3-bet** |
| 🟨 Yellow | Medium / Playable hands | **Call / Limp** |
| 🟥 Red | Weak / Trash hands | **Fold** |
| 🟦 Blue | Marginal / Position-dependent | Depends on position |

> 💡 The preflop matrix is the foundation of building a standardized strategy. Strictly adhering to preflop ranges over the long run is what separates winning players from losing players.

---

## 🤖 Module 4: AI Coach Chat

Chat with an intelligent poker coach to get strategy advice, review tips, and personalized practice plans.

### Example Questions You Can Ask

- "My bankroll is only 20 buy-ins. What strategy should I use?"
- "What do the yellow squares in the preflop matrix mean?"
- "I have AK. How should I play post-flop?"
- "How do I apply the Kelly formula in real games?"
- "How can I reduce my risk of ruin?"

> The AI coach answers based on a built-in poker strategy knowledge base, providing instant learning assistance.

---

## 🛠️ Project Structure

```
texas-holdem-calculator/
├── index.html              # Main page (UI + interaction logic)
├── css/
│   └── style.css           # Green felt theme + Tesla minimalist layout
├── js/
│   ├── i18n.js             # Chinese/English bilingual translation system (100+ keys)
│   └── poker-engine.js     # Core engine
│       ├── Hand Evaluation    # 10 hand rankings (including A-2-3-4-5 baby straight)
│       ├── Probability Calc   # Exact enumeration + Monte Carlo dual mode
│       ├── Equity Simulation  # Equity vs. random opponent (Monte Carlo)
│       ├── Preflop Matrix     # 13×13 starting hand ranges by position
│       ├── Kelly Criterion    # Full / Half / Quarter Kelly
│       ├── Risk of Ruin     # Risk of Ruin calculation
│       └── EV Analysis        # Expected value + bankroll management synthesis
├── test/
│   └── test-engine.cjs     # Unit tests
├── sw.js                   # Service Worker (PWA offline support)
├── manifest.json           # PWA configuration
├── README.md               # Chinese documentation
└── README_EN.md            # English documentation
```

### Tech Stack

- **Pure Vanilla JavaScript** (ES6+) — Zero frameworks
- **Pure CSS3** (CSS Variables + Grid + Flexbox) — Zero UI libraries
- **Zero dependencies, zero build steps** — Open HTML and use immediately

### Core Algorithms

1. **Hand Evaluation**: Enumerate C(7,5)=21 combinations from 7 cards, take the strongest hand
2. **Probability Calculation**: Exact enumeration for combinations ≤ 2 million; otherwise Monte Carlo with 200,000 samples
3. **Equity Simulation**: Your hand vs. random opponent hand, 5,000 Monte Carlo simulations
4. **Preflop Matrix**: 169 starting hands × 6 positions of standardized range data
5. **Kelly Criterion**: f* = (bp − q) / b, supports Full / Half / Quarter Kelly
6. **Risk of Ruin**: R = ((1−edge)/(1+edge))^buyIns

---

## ⚠️ Disclaimer

This project is for **educational and entertainment purposes only**. Texas Hold'em involves gambling risks. Please play responsibly and within your means.

- All data provided by this tool is based on mathematical models and Monte Carlo simulations, **for reference only**
- Factors such as opponent ranges, position, and table image are not incorporated into the calculations
- **This tool does not guarantee any profit** and does not constitute investment advice

---

<p align="center">
  Good luck, and may the river always be friendly to you! 🍀
</p>
