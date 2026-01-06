import React, { useState, useMemo } from "react";
import "./styles.css";

function classifyHeat(level, maxHeat) {
  if (!level || maxHeat === 0) return null;
  const ratio = level / maxHeat;
  if (ratio < 0.33) return "low";
  if (ratio < 0.66) return "mid";
  return "high";
}

function describeScore(score) {
  if (score < 20) return "Very low similarity";
  if (score < 40) return "Mostly original";
  if (score < 60) return "Some overlap detected";
  if (score < 80) return "Significant overlap";
  return "Highly similar / likely plagiarised";
}

function analyseCodes(codeA, codeB) {
  const linesA = codeA.replace(/\r\n/g, "\n").split("\n");
  const linesB = codeB.replace(/\r\n/g, "\n").split("\n");

  const normB = new Map();
  linesB.forEach((line) => {
    const key = line.trim();
    if (!key) return;
    normB.set(key, (normB.get(key) || 0) + 1);
  });

  const heatByLine = {};
  let copiedCountA = 0;

  linesA.forEach((line, idx) => {
    const key = line.trim();
    const occ = normB.get(key) || 0;
    heatByLine[idx + 1] = occ;
    if (occ > 0) copiedCountA += 1;
  });

  const totalLinesA = linesA.length;
  const totalLinesB = linesB.length;

  const copiedRatioA = totalLinesA ? copiedCountA / totalLinesA : 0;

  const plagiarismScore = Math.round(
    copiedRatioA *
    (totalLinesA && totalLinesB
      ? (2 * Math.min(totalLinesA, totalLinesB)) / (totalLinesA + totalLinesB)
      : 1) *
    100
  );

  const maxHeat = Object.values(heatByLine).reduce((acc, v) => Math.max(acc, v), 0);

  // Build ranges of copied lines
  const ranges = [];
  let current = null;
  linesA.forEach((lineText, idx) => {
    const ln = idx + 1;
    const heatLevel = heatByLine[ln] || 0;
    if (heatLevel > 0) {
      if (!current) {
        current = { start: ln, end: ln, maxHeat: heatLevel, snippet: lineText };
      } else if (ln === current.end + 1) {
        current.end = ln;
        current.maxHeat = Math.max(current.maxHeat, heatLevel);
        if (!current.snippet.trim()) current.snippet = lineText;
      } else {
        ranges.push(current);
        current = { start: ln, end: ln, maxHeat: heatLevel, snippet: lineText };
      }
    } else if (current) {
      ranges.push(current);
      current = null;
    }
  });
  if (current) ranges.push(current);
  ranges.sort((a, b) => b.maxHeat - a.maxHeat);

  return { linesA, heatByLine, totalLinesA, copiedLines: copiedCountA, maxHeat, plagiarismScore: Math.min(100, Math.max(0, plagiarismScore)), ranges };
}

function App() {
  const [codeA, setCodeA] = useState(`int main() {\n    int a = 0;\n    int b = a + 1;\n    if (b > 0) {\n        b++;\n    }\n    return b;\n}`);
  const [codeB, setCodeB] = useState(`int main() {\n    int x = 0;\n    int y = x + 1;\n    if (y > 0) {\n        y++;\n    }\n    return y;\n}`);
  const [showHeat, setShowHeat] = useState(true);

  const analysis = useMemo(() => analyseCodes(codeA, codeB), [codeA, codeB]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-dot"></div>
          <span className="brand-title">Plagiarism Visualiser</span>
        </div>
        <div className="header-meta">
          <span className="meta-label">Mode</span>
          <span className="meta-value">React · Live comparison</span>
        </div>
      </header>

      <main className="app-main">
        <section className="summary-panel">
          <div className="score-card">
            <div className="score-label">Plagiarism score</div>
            <div className="score-value">{analysis.plagiarismScore || 0}%</div>
            <div className="score-desc">{describeScore(analysis.plagiarismScore || 0)}</div>
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: `${analysis.plagiarismScore || 0}%` }}></div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total lines (A)</div>
              <div className="stat-value">{analysis.totalLinesA}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Copied lines (A)</div>
              <div className="stat-value">{analysis.copiedLines}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Max heat</div>
              <div className="stat-value">{analysis.maxHeat}</div>
            </div>
          </div>

          <div className="legend">
            <div className="legend-title">Heatmap legend</div>
            <div className="legend-scale">
              <div className="legend-color legend-low"></div><span>Low similarity</span>
              <div className="legend-color legend-mid"></div><span>Medium</span>
              <div className="legend-color legend-high"></div><span>High</span>
            </div>
          </div>
        </section>

        <section className="code-panel">
          <div className="code-panel-header">
            <div className="code-title-group">
              <span className="code-title">Source code A</span>
              <span className="code-subtitle">Heatmap based on overlap with code B</span>
            </div>
            <div className="code-controls">
              <label className="toggle">
                <input type="checkbox" checked={showHeat} onChange={(e) => setShowHeat(e.target.checked)} />
                <span className="toggle-label">Show heatmap</span>
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px", marginBottom: "6px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="code-subtitle">Code A</span>
              <textarea value={codeA} onChange={(e) => setCodeA(e.target.value)} style={{ width: "100%", minHeight: "110px", resize: "vertical", borderRadius: "10px", border: "1px solid rgba(52,64,111,0.9)", background: "rgba(5,7,14,0.95)", color: "#e7ebff", padding: "8px 10px", fontFamily: '"JetBrains Mono", monospace', fontSize: "12px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="code-subtitle">Code B</span>
              <textarea value={codeB} onChange={(e) => setCodeB(e.target.value)} style={{ width: "100%", minHeight: "110px", resize: "vertical", borderRadius: "10px", border: "1px solid rgba(52,64,111,0.9)", background: "rgba(5,7,14,0.95)", color: "#e7ebff", padding: "8px 10px", fontFamily: '"JetBrains Mono", monospace', fontSize: "12px" }} />
            </div>
          </div>

          <div className="code-view">
            {analysis.linesA.map((lineText, idx) => {
              const ln = idx + 1;
              const heatLevel = analysis.heatByLine[ln] || 0;
              const heatClass = classifyHeat(heatLevel, analysis.maxHeat);
              const classes = ["code-line"];
              if (heatLevel > 0) classes.push("code-line--copied");
              if (heatClass) classes.push(`code-line--heat-${heatClass}`);

              return (
                <div key={ln} className={classes.join(" ")}>
                  <div className="code-line-number">{ln.toString().padStart(3, " ")}</div>
                  <div className="code-line-bar" style={{ opacity: showHeat ? 1 : 0 }}></div>
                  <div className="code-line-content">{lineText.length ? lineText : " "}</div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="insight-panel">
          <div className="insight-header">
            <span className="insight-title">Copied regions (Code A)</span>
            <span className="insight-subtitle">Sorted by severity</span>
          </div>
          <div className="insight-list">
            {analysis.ranges.length === 0 ? (
              <div className="insight-item">No copied regions detected.</div>
            ) : (
              analysis.ranges.map((range, idx) => {
                const heatClass = classifyHeat(range.maxHeat, analysis.maxHeat);
                const itemClasses = ["insight-item"];
                if (heatClass === "high") itemClasses.push("insight-item-high");
                return (
                  <div key={idx} className={itemClasses.join(" ")}>
                    <div className="insight-lines">
                      {range.start === range.end ? `Line ${range.start}` : `Lines ${range.start} – ${range.end}`}
                    </div>
                    <div className="insight-heat">Heat: {range.maxHeat}</div>
                    <div className="insight-snippet">{range.snippet || "(whitespace)"}</div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
