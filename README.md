# Plagiarism Visualizer

A compiler-inspired plagiarism detection system written in C++ that detects logical similarity between programs even after renaming variables, changing formatting, or making small edits.  
Unlike traditional text-based tools, this engine analyzes normalized token streams and rolling hash fingerprints to identify copied logic.


<img width="1321" height="572" alt="Screenshot 2026-01-06 190141" src="https://github.com/user-attachments/assets/bb43d8b6-8ebb-45da-80a6-a7083cc6c60f" />

---

## Features

- Compiler-style lexical tokenization  
- Identifier, function and literal normalization  
- K-gram fingerprinting using Rabin–Karp Rolling Hash  
- Partial plagiarism detection  
- Line-level plagiarism heatmap  
- Visual highlighting of copied lines  
- Extendable language-agnostic design  

---

## How It Works
```bash
Source Code
     ↓
Tokenizer (Lexical Analyzer)
     ↓
Normalizer (VAR / NUM / FUNC abstraction)
     ↓
Token Encoder
     ↓
Rolling Hash Fingerprints (K-grams)
     ↓
Fingerprint Matching
     ↓
Similarity Score + Line Heatmap
```

---

## Algorithms & DSA Used

- Hash Tables (unordered_map, unordered_set)  
- Sliding Window (K-gram generation)  
- Rabin–Karp Rolling Hash  
- Sets and Maps  
- Greedy Counting  
- Similarity Metrics  

---
## How To Use
```bash
1. git clone https://github.com/divyaaachaudhary/Plagiarism-Code-Detector.git
2. npm install
3. npm start
4. Open in Browser - The app will automatically open at:
http://localhost:3000
          OR
use the deployed link - https://plagiarism-code-detector.vercel.app/
