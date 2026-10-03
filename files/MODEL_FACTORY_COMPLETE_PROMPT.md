# MODEL FACTORY — Complete AI Agent Training Platform
## Full Build Specification — Copy This Entire Document Into Your IDE or AI

---

## PROJECT OVERVIEW

Build a desktop-style web application called **ModelFactory** — a complete
platform for creating, training, and deploying autonomous AI agents that
control desktop applications through computer vision and imitation learning.
No external AI APIs. All models train locally from user-provided videos.

The primary use case is a Coinglass desktop app controller that reads
liquidity heatmap data autonomously. But the platform is general-purpose —
any desktop automation task can be trained.

---

## TECH STACK

### Frontend (UI)
- React with hooks (useState, useEffect, useRef, useCallback)
- No external UI libraries — all custom components
- CSS-in-JS via inline styles
- Monospace terminal aesthetic — dark theme
- Font: Courier New / monospace

### Backend (Python)
- PyQt6 for desktop app wrapper
- FastAPI for local API server (UI talks to Python backend)
- SQLite for storing model metadata and training history
- File system for model weights and recordings

### ML / Training
- TensorFlow / Keras for model architecture
- MobileNetV2 as CNN backbone (transfer learning base)
- OpenCV for computer vision and screen capture
- mss for fast screen capture
- pytesseract for OCR
- scikit-learn for dataset utilities
- numpy for array operations

### Desktop Control
- pywin32 (win32gui, win32con, win32api) for Windows window management
- pyautogui for mouse/keyboard control
- pynput for recording mouse/keyboard events
- ctypes for DPI awareness

### Other
- pathlib for file management
- json for config files
- threading for parallel training
- subprocess for app launching

---

## COMPLETE FILE STRUCTURE

```
ModelFactory/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    ← root component
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── NavBar.jsx         ← left navigation
│   │   │   │   ├── TopBar.jsx         ← top bar
│   │   │   │   └── TrafficOverlay.jsx ← floating training overlay
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx      ← main dashboard screen
│   │   │   │   ├── ModelCard.jsx      ← live status card
│   │   │   │   ├── Terminal.jsx       ← live log terminal
│   │   │   │   └── DailyOps.jsx       ← daily operations view
│   │   │   ├── model/
│   │   │   │   ├── ModelScreen.jsx    ← model detail wrapper
│   │   │   │   ├── tabs/
│   │   │   │   │   ├── DataTab.jsx
│   │   │   │   │   ├── LabelTab.jsx
│   │   │   │   │   ├── ActionsTab.jsx
│   │   │   │   │   ├── ResetTab.jsx
│   │   │   │   │   ├── TrainTab.jsx
│   │   │   │   │   ├── ScoringTab.jsx
│   │   │   │   │   ├── GoalsTab.jsx
│   │   │   │   │   └── ResultsTab.jsx
│   │   │   ├── macro/
│   │   │   │   ├── MacroBuilder.jsx   ← main macro screen
│   │   │   │   ├── FlowCanvas.jsx     ← visual flowchart canvas
│   │   │   │   ├── NodeTypes.jsx      ← all node components
│   │   │   │   ├── PropertiesPanel.jsx← right config panel
│   │   │   │   └── MacroSettings.jsx  ← macro global settings
│   │   │   └── settings/
│   │   │       └── Settings.jsx
│   │   └── utils/
│   │       ├── api.js                 ← talks to Python backend
│   │       ├── tokens.js              ← design tokens
│   │       └── helpers.js
│   └── index.html
│
├── backend/
│   ├── main.py                        ← FastAPI server entry point
│   ├── api/
│   │   ├── models_api.py              ← model CRUD endpoints
│   │   ├── training_api.py            ← training control endpoints
│   │   ├── calibration_api.py         ← calibration endpoints
│   │   └── macro_api.py               ← macro endpoints
│   ├── core/
│   │   ├── model_factory.py           ← creates model architecture
│   │   ├── training_loop.py           ← self-improving loop
│   │   ├── attempt_executor.py        ← runs model on real app
│   │   ├── score_calculator.py        ← calculates real score
│   │   ├── reset_controller.py        ← 3-layer reset system
│   │   ├── checkpoint_manager.py      ← saves/loads snapshots
│   │   ├── overfitting_monitor.py     ← validation tracking
│   │   ├── drift_detector.py          ← post-deploy monitoring
│   │   └── augmentation.py            ← data augmentation
│   ├── vision/
│   │   ├── screen_capture.py          ← mss screen capture
│   │   ├── cluster_detector.py        ← OpenCV heatmap detection
│   │   ├── ocr_reader.py              ← tesseract OCR
│   │   ├── goal_matcher.py            ← similarity comparison
│   │   └── preprocessor.py            ← image preprocessing
│   ├── desktop/
│   │   ├── window_controller.py       ← win32gui window control
│   │   ├── action_executor.py         ← pyautogui actions
│   │   └── recorder.py                ← pynput recording
│   ├── data/
│   │   ├── frame_extractor.py         ← video → frames
│   │   ├── dataset_builder.py         ← build dataset.npz
│   │   ├── health_checker.py          ← dataset validation
│   │   └── label_manager.py           ← label CRUD
│   └── database/
│       ├── db.py                      ← SQLite connection
│       └── models.py                  ← SQLite schema
│
├── models/                            ← all trained models live here
│   └── [model_name]/
│       ├── config.json
│       ├── reference/
│       ├── extracted/
│       ├── labeled/
│       ├── augmented/
│       ├── goals/
│       ├── checkpoints/
│       ├── best/
│       ├── logs/
│       ├── attempts/
│       ├── test_data/
│       ├── live_recordings/
│       └── results/
│
├── macros/                            ← saved macro pipelines
├── exports/                           ← standalone agent exports
├── backups/                           ← scheduled backups
├── calibration.json                   ← global UI calibration
└── settings.json                      ← global settings
```

---

## DESIGN SYSTEM

### Colors (CSS variables or JS tokens)
```
bg0:     #05080b   (darkest background)
bg1:     #090d12   (nav background)
bg2:     #0e1419   (panel background)
bg3:     #141c24   (card background)
border:  #1a2535   (default border)
borderB: #243040   (bright border)
amber:   #f59e0b   (primary accent)
amberD:  #b45309   (dark amber)
green:   #10b981   (success)
red:     #ef4444   (error)
blue:    #3b82f6   (info)
cyan:    #06b6d4   (secondary)
purple:  #8b5cf6   (special)
text:    #94a3b8   (body text)
textB:   #cbd5e1   (bright text)
textD:   #475569   (muted text)
white:   #f1f5f9   (headings)
```

### Typography
- All UI: 'Courier New', Courier, monospace
- Sizes: 9px labels, 10-11px body, 12-13px values, 14-16px headings

### Status Colors
```
trained:   #10b981 green
training:  #f59e0b amber
untrained: #475569 grey
error:     #ef4444 red
```

---

## COMPLETE UI SPECIFICATION

---

### LEFT NAVIGATION BAR

Fixed left sidebar, 220px wide.

#### Top Logo
```
◈ ModelFactory
```

#### Nav Items (in order)
```
⬡ Dashboard              ← red badge if any model errored
⊞ Models            ▸    ← expand/collapse arrow
  ● open_coinglass        ← colored dot = status
  ◐ click_clusters  ⚠    ← warning badge if needs attention
  ● read_popup
  ○ assess_chart
  ──────────────────
  + Create New Model
⬡ Macro Builder     ▸
  coinglass_agent
  ──────────────────
  + Create New Macro
⚙ Settings
```

#### Nav Dot Colors
```
● green  = trained
◐ amber  = currently training
○ grey   = no data
✗ red    = error
```

#### Right-Click Context Menu on Model Name
```
Open
Begin Training
Pause Training
Stop Training
─────────────
Duplicate
Delete
```

#### Badge System
- Red number badge on Models nav item if any model has error
- Red number badge on Dashboard if active errors exist
- Amber badge on model name if needs retraining (drift detected)

---

### DASHBOARD SCREEN

URL/route: /dashboard

#### Header
```
DASHBOARD
Unsupervised Model Training Monitor
```

#### View Toggle
```
[Training View]  [Daily Operations]
```

#### Training View Content

**Active Model Status Cards** — grid layout, 2-3 per row
Each card shows:
```
[status dot] [model name]
[status label]
[score sparkline mini chart]
Attempt: 47 / ∞
Performance: 78.3
Best: 81.2 (att.39)
Success Rate: 74%
[progress bar]
[Pause] [Stop] buttons if training
[Run] [Retrain] buttons if trained
```

**Terminal — Live Logs**

Tabbed terminal below model cards:
- Tab: All (merged logs from all models)
- Tab per active training model
- Each tab shows colored dot if that model errored

Log format:
```
[14:32:01] click_clusters  Attempt 47 started
[14:32:02] click_clusters  Master Reset running
[14:32:03] click_clusters  Verify: popup clear ✓
[14:32:04] click_clusters  Verify: heatmap found ✓
[14:32:05] click_clusters  Confirm: match 82% ✓
[14:32:06] click_clusters  Model attempting task...
[14:32:09] click_clusters  Performance: 78.3
[14:32:09] click_clusters  Snapshot saved (att.47)
```

Terminal controls: [Clear] [Export Log] [Pause Scroll]

#### Daily Operations View Content

Simplified view for non-training days:
```
TODAY'S RUNS
─────────────────────────────────────────
XRPUSDT 15m  ✓  2.3s   91 pts  14:32
BTCUSDT  1h  ✓  3.1s   88 pts  11:18
ETHUSDT  4h  ✗  --     --      09:44  [Debug]

AGENT HEALTH
click_clusters:    ● Confident (avg 84%)
read_popup:        ● Confident (avg 91%)
assess_chart:      ⚠ Declining (avg 61%) → Retrain recommended

[Run Agent Now]  [View Training Dashboard]
```

---

### TRAFFIC LIGHT OVERLAY

Floating window, always on top, draggable, appears when platform minimized.

#### Single Model Training
```
┌────────────────────┐
│  ●  TRAINING       │  ← colored dot
│  click_clusters    │
├────────────────────┤
│  Attempt:   47     │
│  Score:     78.3   │
│  Best:      81.2   │
│  Time:   00:23:14  │
├────────────────────┤
│  [⏸]  [■]   [↗]  │
│  Pause Stop  Open  │
└────────────────────┘
```

#### Multiple Models Training
```
┌────────────────────┐
│  ●  2 RUNNING      │
├────────────────────┤
│  click_clusters 78 │
│  read_popup     91 │
├────────────────────┤
│  [⏸ All] [■ All]  │
│  [↗ Open Dashboard]│
└────────────────────┘
```

#### Three States
```
Green  ● TRAINING    pulsing animation
Amber  ● PAUSED      static
Red    ● ERROR       fast flash animation
```

#### Collapse Mode
Single colored dot in screen corner. Click to expand. Color shows worst status of all running models.

---

### MODEL SCREEN

Opened by clicking model card or model name in nav.

#### Model Header (always visible)
```
← BACK    [model name]    [status dot + label]    [task type tag]
          [description]
          Score: 94.2   Videos: 12   Frames: 2847
                                            [▶ RUN MODEL]
```

#### 8 Tabs
```
Data · Label · Actions · Reset · Train · Scoring · Goals · Results
```

---

#### TAB 1 — DATA

**Screen Region Selector** (CRITICAL — at very top)
```
SCREEN REGION
──────────────────────────────────────────────
Define which part of screen this model looks at.
Each model should only see its relevant area.

Current region: [chart canvas 60,110 to 1150,720]
[Redefine Region]  ← opens fullscreen overlay
                      user draws rectangle
                      coordinates auto-captured

For reference:
  open_coinglass  → full screen
  assess_chart    → full Coinglass window
  click_clusters  → chart canvas only
  read_popup      → popup area only
```

**Reference Folder**
```
📂 models/click_clusters/reference/
[Open Folder]  [Copy Path]
```

**Drop Zone**
```
Drag videos or images here
Supported: .mp4 .avi .mov .png .jpg
[Browse Files]
```

**Loaded Files List**
Each file shows: icon, name, duration/size, [Preview] [Remove]

**Frame Extraction**
```
[Extract All Frames]
every_n_frames: [5] (configurable)
Progress bar during extraction
Result: 5,400 frames ready
[View Frames]  [Clear Extracted]
```

**Preprocessing Pipeline** (NEW)
```
PREPROCESSING PIPELINE
──────────────────────────────────────────────
Resize:         224 × 224  (fixed)
Color space:    ● RGB  ○ Grayscale  ○ HSV
Normalize:      ● 0-1  ○ -1 to 1  ○ None
Contrast:       [ON]

Same pipeline applies during training AND live inference.
[Preview on Sample Frame]
[Save Config]
```

**Data Augmentation** (NEW)
```
DATA AUGMENTATION
──────────────────────────────────────────────
☑ Brightness variation   ±20%
☑ Color jitter           ±15%
☑ Slight zoom            ±10%
☑ Horizontal flip
☐ Rotation               (off for charts)
☐ Gaussian noise         (off for charts)

Current dataset:    847 samples
After augmentation: 3,388 samples (4× increase)

[Apply Augmentation]
[Preview Augmented Sample]
```

**Dataset Health Check** (NEW)
```
[Run Health Check]

Results panel shows:
✓ No corrupted images
✓ Correct sizes
⚠ 47 near-duplicates found  [Remove Duplicates]
⚠ Click imbalance: 68% center-right  [View Details]
✓ Sufficient session variety

Overall: MODERATE
[Fix All Issues]  [Continue Anyway]
```

---

#### TAB 2 — LABEL

**Auto-Detection**
```
[Run Auto-Label]
Status: 1,203 events detected
```

**Manual Review**
```
[Open Label Tool]
Progress: 847 / 2,847 frames reviewed
████████████░░░░░░░░  42%
```

Label Tool keyboard controls:
```
C → mark click (then click location on screen)
S → slider adjustment
Z → zoom
P → pan/drag
X → skip
D → next frame
A → previous frame
Q → save and quit
```

**Label Summary**
```
✓ Clicks:       423
✓ Scrolls:       89
✓ No-action:  1,203
✗ Unlabeled:     47  [Review These]
```

**Label Consistency Checker** (NEW)
```
[Run Consistency Check]

"Found 12 suspicious inconsistencies:
 Frame 0234 and Frame 0891 look similar
 but you labeled different click positions.
 Which is correct?"
[Review Inconsistencies]
```

**Compile Training Data**
```
[Compile Training Data]

Training set:   80%  → 2,710 samples
Validation set: 15%  →   507 samples
Test set:        5%  →   169 samples (locked)

[Ready ✓]
```

---

#### TAB 3 — ACTIONS

**Purpose Explanation Banner**
```
ℹ WHAT IS THIS TAB?
Actions are fixed sequences of steps that DO NOT need a model.
Use this for things that are always the same regardless of screen state:
  - Pressing Escape to close popups (always the same key)
  - Clicking the 15m button (always the same position)
  - Launching the app (always the same process)
Your reset sequence lives here — it runs automatically before every training attempt.
```

**Live Recorder**
```
[● START RECORDING]

When recording is active:
  Red pulsing dot
  Timer counting up
  "Switch to your app and perform the task"
  
[■ STOP (23s)]  → saves as new sequence
```

**Saved Sequences**
Each sequence shows:
```
[sequence name]  [RESET SEQUENCE tag if applicable]  [step count]
[▶ Play]  [✏ Edit]  [🗑 Delete]

Expanded view shows all steps as chips:
👆 click(460,55)  ⌨️ Escape  🖱️ scroll(-10)  ⏱️ wait(1.5s)
```

**Add Step Manually**
```
Action type radio buttons:
click  double_click  right_click  drag  scroll  key  wait  type

Context-sensitive fields appear:
  click → X field, Y field, [Pick from Screen] button
  key   → key/shortcut field
  wait  → seconds field
  scroll→ amount field (-=down)
  type  → text field

[Add to Sequence dropdown]
[Add Step] button
```

**Pick from Screen** — opens transparent overlay on entire screen, user clicks anywhere, coordinates captured automatically.

**Conditional Logic**
```
IF [condition dropdown] THEN run [sequence dropdown]
[+ Add Condition]

Conditions available:
  App is open / App is closed
  Popup is visible / Popup not visible
  Chart has heatmap / Chart empty
  Previous step succeeded / failed
```

---

#### TAB 4 — RESET

**Purpose Explanation Banner**
```
ℹ THE RESET SYSTEM
Before every training attempt the app must be in a known clean state.
Three layers work together to guarantee this:
  Master Reset → runs your recorded steps to force clean state
  Verify       → instant pixel checks to confirm reset worked
  Confirm      → compares screenshot to your goal image as final check
```

**MASTER RESET Section**
```
MASTER RESET
──────────────────────────────────────────────
Runs first. Replays your recorded sequence to
force app back to known state.

Active sequence: [ Reset Chart State ▼ ]
Steps preview:
  ⌨️ Escape  ⌨️ Escape  🖱️ scroll(-10)
  👆 click(460,55)  ⏱️ wait(1.5s)

[ Change Sequence ]
[ ▶ Test Master Reset Now ]
Last test: ✓ Completed in 2.3s
```

**VERIFY Section**
```
VERIFY
──────────────────────────────────────────────
Runs after Master Reset. Instant pixel analysis
checks that the reset actually worked.

Active checks:
✓ No popup visible       [ON/OFF]  [Test]
✓ Heatmap data present   [ON/OFF]  [Test]
✓ Chart not over-zoomed  [ON/OFF]  [Test]
✓ App window focused     [ON/OFF]  [Test]
[ + Add Custom Check ]
[ ▶ Run All Checks Now ]

If any check fails:
→ Auto-recovery: [ Scroll out + Escape ▼ ]
→ Re-check once
→ If still failing → trigger Confirm alert
```

**CONFIRM Section**
```
CONFIRM
──────────────────────────────────────────────
Final gate. Compares screenshot to your
Success Reference before allowing attempt.

Using: goal_chart_ready.png (from Goals tab)
Required match: [75%] slider

On fail:
● Retry Master Reset (up to 3 times)
○ Skip this attempt
○ Pause training and alert me

[ ▶ Test Confirm Now ]
Last result: 84% match ✓ PASSES
```

---

#### TAB 5 — TRAIN

**Training Mode Selection**
```
TRAINING MODE
● Self-Improving Loop    Reset & retry until perfect
○ Single Pass            Train once on dataset
○ Fine-tune Existing     Improve current model
```

**Stop Condition**
```
● Run forever (manual stop)
○ Stop at performance: [95.0]
○ Stop after attempts: [200]
○ Stop when I say so
```

**Training Variety** (NEW — pair rotation)
```
TRAINING VARIETY
Rotate through these pairs/timeframes during training:
☑ XRPUSDT 15m
☑ BTCUSDT  1h
☑ ETHUSDT  4h
☐ SOLUSDT  15m
[+ Add Pair]
```

**Transfer Learning** (NEW)
```
TRANSFER LEARNING
Start from:
● Fresh (random weights)
○ Existing model: [ click_clusters ▼ ]
  Trains 40% faster, needs 50% less data
```

**Pipeline Training Mode** (NEW)
```
PIPELINE TRAINING (optional)
Train this model alongside another for better coordination.
○ OFF
● ON → paired with: [ assess_chart ▼ ]
Both models rewarded from combined pipeline result.
```

**Training Controls**
```
[▶ BEGIN TRAINING LOOP]   ← main button, large

When running:
[⏸ PAUSE]  [■ STOP]  [✓ I AM SATISFIED — SAVE & STOP]
```

**Live Training Monitor**
```
LIVE MONITOR
──────────────────────────────────────────────
Attempt:  47 / ∞
Score:    78.3
Best:     81.2  (attempt 39)
Time:     00:23:14
Trend:    ↑ +2.1 (last 5)

Score History Chart (80px tall sparkline)

Reset Pipeline Status:
idle → [RESETTING] → verifying → ready
(lights up in sequence with colors)
```

**Auto-Record Live Runs Toggle** (NEW)
```
AUTO-RECORD LIVE RUNS  [ON/OFF]
Saves every attempt as replay video.
Successful runs auto-added to training data.
```

**Overfitting Monitor** (NEW)
```
OVERFITTING MONITOR
Training score:    78.3  ↑
Validation score:  76.1  ↑
Gap:               2.2   ✓ Healthy
Status: No overfitting detected
```

**Training Log**
```
Scrollable terminal showing live log lines
[Clear]  [Export]
```

**Training Scheduler** (NEW)
```
TRAINING SCHEDULER
Schedule automatic training sessions:
○ OFF
● ON
  Time: [02:00 AM]
  Attempts: [50]
  Stop by: [06:00 AM]
  Days: ☑ Mon ☑ Tue ☑ Wed ☑ Thu ☑ Fri ☐ Sat ☐ Sun
```

---

#### TAB 6 — SCORING

**Mode Selection**
```
SCORING MODE
● Auto-Score      works immediately, no config needed
○ Manual Rules    configure your own rewards
○ Goal Match Only requires Goals tab image
```

**Auto-Score breakdown** (always visible)
```
Auto-Score evaluates:
  Task completed without error    +40
  Output produced (not empty)     +30
  Completed within time limit     +20
  Goal image match                +10
  Total possible: 100
```

**LAYER 1 — Goal Image Match** (when Manual Rules selected)
```
[ON/OFF]  Weight: [30%]
Requires: Goals tab images
Status: 2 images found ✓
```

**LAYER 2 — Reward Rules**
```
REWARDS                          PENALTIES
+ Cluster found      +10  [✕]   - Missed wall     -30  [✕]
+ Value read         +15  [✕]   - Wrong click     -15  [✕]
+ Over 1M found      +35  [✕]   - Too slow        -20  [✕]
+ Biggest wall       +50  [✕]   - Crash           -50  [✕]
[+ Add Reward]                  [+ Add Penalty]

Penalty weight slider:
Lenient ────●──────── Strict
            1:2
```

**LAYER 3 — Behavior Analysis**
```
[ON/OFF]  Weight: [20%]  (auto, no config needed)
✓ Click spread analysis     [ON]
✓ Sequence quality          [ON]
✓ Retry detection           [ON]
✓ Time distribution         [ON]
```

**Diminishing Returns**
```
[ON/OFF]
Second click same area: 10% of reward
Third click same area: penalty
```

**Curriculum Mode**
```
[ON/OFF]
Phase 1: Attempts 1-20    Layer 1 only
Phase 2: Attempts 21-60   Layers 1+2
Phase 3: Attempts 61+     All layers
[+ Add Phase]
```

**Reward Timing**
```
● Dense    score after every action
○ Sparse   score at attempt end only
○ Mixed    score at key checkpoints
```

**Confidence Threshold** (NEW)
```
CONFIDENCE THRESHOLD
Only act if model confidence above: [65%]
Below this: model skips rather than guesses

Effect estimate:
  Would skip: 12 of 89 attempts (13.5%)
  Would avoid: 9 of 18 failures
  Net improvement: +8% success rate
[Apply Recommended: 68%]
```

**Score Preview**
```
Max possible: 100
Estimated range: 65-85 (based on history)
[Save Config]  [Reset to Defaults]  [Copy from Model ▼]
```

---

#### TAB 7 — GOALS

**Purpose Banner**
```
ℹ SUCCESS REFERENCE
Upload screenshots showing what success looks like.
After each training attempt the system compares
the result to these images. Closer match = higher score.
No scoring rules needed — just show the target.
```

**Goal Images Drop Zone**
Same pattern as Data tab drop zone.

**Uploaded Goals Grid**
Each goal image shows:
```
[thumbnail]
[filename]
Last match: 82% ✓
[Preview]  [Remove]
```

**Similarity Threshold Slider**
```
Match required: [75%]
50% lenient ─────●───── 99% strict
```

**Confidence Heatmap View** (NEW)
```
CONFIDENCE HEATMAP
Shows model's visual certainty across the chart.

[Generate Heatmap on Current Screen]

Color overlay on chart:
  Deep green  = high confidence cluster here
  Light green = moderate confidence
  Yellow      = uncertain
  Nothing     = model sees nothing

Helps identify which areas need more training data.
```

**Test Goal Matching**
```
[Test Current Screen Now]
Result: 84% match to goal_chart_ready.png ✓ PASSES
```

---

#### TAB 8 — RESULTS

**Model Versions**
```
v3  ● ACTIVE   Score: 94.2   Today      [Export]
v2             Score: 87.1   Yesterday  [Activate] [Export] [Delete]
v1             Score: 71.3   3 days ago [Activate] [Export] [Delete]
```

**Session Comparison Tool** (NEW)
```
[Compare Two Versions]
Select: [v2 ▼] vs [v3 ▼]
[Open Side-by-Side Comparison]

Left: v2 attempt replay
Right: v3 attempt replay
Differences highlighted
```

**Performance Stats**
```
Success Rate:   79.8%
Best Score:     94.2
Total Attempts: 89
Avg Time:       2.2s
```

**Error Analysis** (NEW — error categorization)
```
ERROR ANALYSIS
Total failures: 18

Reset errors:   3   [View Details]
Vision errors:  6   [View Details]  ← most common
Click errors:   4   [View Details]
OCR errors:     3   [View Details]
App errors:     2   [View Details]

Top suggestion: Vision errors (6)
→ Add more varied training videos
→ Check screen region definition
```

**Test Model on New Data** (NEW)
```
[Test Model on New Data]
Drop screenshots here — ones model never saw

Results:
[screenshot with prediction overlaid]
Green circles = predicted clicks
Confidence % shown on each

Performance on new data: 91.2%
```

**Evaluate on Test Set** (NEW)
```
[Evaluate on Locked Test Set]
Uses the 5% held back since compilation.
This score is your honest real-world number.

Performance: 88.4
Click accuracy: 91.2%
OCR accuracy: 89.7%
False positive rate: 8.3%
Verdict: Generalizes well ✓
```

**Attempt History with Replays** (NEW)
```
Attempt 39  Score: 81.2  BEST   ✓  [▶ Replay]
Attempt 47  Score: 78.3         ✓  [▶ Replay]
Attempt 23  Score: 42.1  FAIL   ✗  [▶ Replay]  [Debug]
```

Replay viewer: video-like playback with scrubber, shows every action, screenshot at each step, overlays showing clicks and detections.

**Model Drift Monitor** (NEW)
```
MODEL DRIFT MONITOR
Tracks confidence during live deployment.

Last 20 live runs:
Avg confidence: 61%  ↓ (was 84%)

⚠ Performance degrading
Possible cause: market conditions changed
Recommendation: Record new videos, retrain

[Begin Retraining Session]
```

**Export Options**
```
[Export Model]           → .keras file
[Export Standalone Agent] → self-contained Python script
                            runs without platform
```

**Confidence Threshold Setting**
```
Live confidence threshold: [65%]
Below this: skip action rather than guess
[Save]
```

**Pair-Specific Sub-Models** (NEW)
```
SPECIALIZATION
Train pair-specific variants:
Base: click_clusters (general, works on all pairs)
  └── click_clusters_XRP  ○ not created  [Create]
  └── click_clusters_BTC  ○ not created  [Create]
  └── click_clusters_ETH  ○ not created  [Create]

Specialized models: ~15-20% more accurate on that pair
```

**Backup Status** (NEW)
```
BACKUP
Last backup: Today 00:00 ✓
Location: D:\Backups\ModelFactory\
Next backup: Tomorrow 00:00
[Backup Now]  [Change Settings]
```

---

### MACRO BUILDER SCREEN

#### Header
```
MACRO BUILDER
Macro Name: [coinglass_full_agent    ]
[▶ Dry Run]  [💾 Save Macro]  [🚀 Launch Agent]
```

#### Layout
Two-column layout:
- Left/center: flowchart canvas (flexible width)
- Right: properties panel (280px fixed)

Below canvas: macro settings panel

#### Flowchart Canvas

**Toolbar above canvas**
```
[+ Model]  [+ Condition]  [+ Loop]  [+ Parallel]  [+ Action]
[Undo]  [Redo]  |  [Zoom: 100%]  [Fit All]  [Reset View]
```

**Node Types**

Model Node (rounded rectangle):
```
Green border = trained model
Amber border = untrained model
Contains: model name, task type badge, performance score
Input port (left), Output port (right)
```

Condition Node (diamond shape, amber):
```
IF: [what to check]
YES path → right
NO path  → bottom
```

Loop Node (rounded rect with circular arrow, blue):
```
REPEAT UNTIL: [condition]
or
FOR EACH: [list item]
Max: [N] times
```

Parallel Node (wide bar splitting into columns):
```
══════════════════
  branch A    branch B
```

Action Node (rectangle, grey):
```
[action type icon]
[action description]
Save to JSON / Wait / Log / Stop / Run Sequence
```

**Connections**
- Click output port → drag → click input port
- Arrow animates during Dry Run (moving dots)
- Click connection line → delete it

**Canvas Controls**
- Scroll wheel: zoom
- Click empty + drag: pan
- Click node: select (shows properties)
- Drag node: reposition
- Right-click canvas: quick add menu
- Right-click node: duplicate/delete/isolate

**Dry Run Animation**
```
Waiting:   grey node
Running:   amber pulsing node
Success:   green stays on
Failed:    red stays on
Skipped:   grey with strikethrough

Connection lines: animated dots flowing during execution
```

#### Properties Panel (right side)

Changes based on selected node type.

**Model Node selected**
```
PROPERTIES — click_clusters
─────────────────────────────
Model:      click_clusters
Status:     ◐ Training (78.3)

Input from:   [Previous output ▼]
Output to:    [read_popup input ▼]

On success:   [Continue ▼]
On failure:   [Retry 3× ▼]
Timeout:      [30] seconds
Min confidence: [65%]

[Open Model]  [Replace ▼]
```

**Condition Node selected**
```
PROPERTIES — Condition
─────────────────────────────
Check: [Model output ▼]
       [equals ▼]
       [true]

YES path → [next_step ▼]
NO  path → [skip ▼]

[Test Condition Now]
```

**Loop Node selected**
```
PROPERTIES — Loop
─────────────────────────────
Type:  ● Repeat Until
       ○ For Each

Condition: [assess_chart ▼]
           [returns true ▼]

Max loops: [5]
On max:    [Stop macro ▼]
```

#### Macro Settings (below canvas)
```
MACRO SETTINGS
─────────────────────────────────────────
Global on-step-fail:    [Stop macro ▼]
Max total time:         [120] seconds
Save output to:         [data/output.json]
Run on schedule:        [OFF ▼]
Parallel execution:     [OFF]
Notify on complete:     [OFF]
Notify on error:        [ON]

Input this macro accepts: pair name, timeframe
Output this macro returns: JSON with liquidity data

[Save Settings]
```

#### Model Dependency Map (NEW)
```
[View Dependency Map]

Opens visualization:
open_coinglass
  └── assess_chart
        └── optimize_settings
        └── click_clusters
              └── read_popup

When retraining any model:
"This affects 3 downstream models.
 Recommend pipeline retraining after."
```

#### Export Standalone Agent (NEW)
```
[Export Standalone Agent]
Generates: coinglass_agent_standalone.py
Contains all model weights + minimal inference code
Runs without platform: python agent.py XRPUSDT 15m
```

---

### SETTINGS SCREEN

```
SETTINGS
────────────────────────────────────────────────────

COINGLASS DESKTOP APP
  App path: [C:\Program Files\Coinglass\Coinglass.exe]
  [Browse]  [Test Launch]  [Re-Calibrate UI]

TESSERACT OCR
  Path: [C:\Program Files\Tesseract-OCR\tesseract.exe]
  [Browse]  [Test OCR]

OLLAMA (OPTIONAL)
  [OFF toggle]  ← default off
  Model: [qwen3.5:0.8b]
  Keep alive: [0] seconds
  [Test Connection]

TRAINING DEFAULTS
  Auto-save frequency:  [10] attempts
  Max attempts:         [200]
  Popup wait time:      [0.7] seconds
  Attempt timeout:      [60] seconds
  Default confidence:   [65%]

BACKUP SYSTEM  (NEW)
  [ON toggle]
  Backup location: [D:\Backups\ModelFactory\]  [Browse]
  Schedule: [Daily at midnight ▼]
  Keep last: [7] days
  Includes: weights, snapshots, recordings, datasets, config
  [Backup Now]  [View Backups]

TRAINING SCHEDULER  (NEW)
  [ON/OFF toggle]
  Default schedule: [02:00 AM]
  Max duration: [4] hours

PERFORMANCE MONITORING  (NEW)
  Drift detection: [ON]
  Alert threshold: [15%] confidence drop
  Check after every: [20] live runs

[Save All Settings]  [Reset to Defaults]
```

---

## BACKEND ARCHITECTURE

### API Endpoints (FastAPI)

```
GET  /api/models                     list all models
POST /api/models                     create model
GET  /api/models/{id}                get model details
PUT  /api/models/{id}                update model
DELETE /api/models/{id}              delete model

POST /api/models/{id}/extract        extract frames from videos
POST /api/models/{id}/augment        run augmentation
POST /api/models/{id}/health-check   run dataset health check
POST /api/models/{id}/compile        compile training data
POST /api/models/{id}/label/auto     run auto-labeling
GET  /api/models/{id}/labels         get all labels
PUT  /api/models/{id}/labels/{frame} update label

POST /api/models/{id}/train/start    begin training loop
POST /api/models/{id}/train/pause    pause training
POST /api/models/{id}/train/resume   resume training
POST /api/models/{id}/train/stop     stop training
GET  /api/models/{id}/train/status   get live training status
GET  /api/models/{id}/train/log      stream live log

POST /api/models/{id}/test           test on new image
GET  /api/models/{id}/attempts/{n}   get attempt replay data
GET  /api/models/{id}/checkpoints    list all snapshots

POST /api/calibrate                  run UI calibration
GET  /api/calibrate                  get calibration data

GET  /api/macros                     list macros
POST /api/macros                     create macro
GET  /api/macros/{id}                get macro
PUT  /api/macros/{id}                update macro
POST /api/macros/{id}/dry-run        run dry run
POST /api/macros/{id}/launch         launch agent

GET  /api/settings                   get settings
PUT  /api/settings                   save settings
POST /api/backup                     trigger backup
```

### Training Loop Logic (core/training_loop.py)

```python
class SelfImprovingTrainer:
    def run(self, model_id, config):
        while not stop_condition_met():
            self.iteration += 1

            # 1. MASTER RESET
            reset_ok = self.reset_controller.execute()
            if not reset_ok:
                self.emit_log("Master Reset failed — pausing")
                self.pause_and_alert()
                continue

            # 2. VERIFY
            verify_ok = self.reset_controller.verify()
            if not verify_ok:
                self.emit_log("Verify failed — attempting recovery")
                self.reset_controller.recover()
                continue

            # 3. CONFIRM
            confirm_score, confirm_ok = self.reset_controller.confirm()
            if not confirm_ok:
                if self.retry_count < 3:
                    self.retry_count += 1
                    continue
                else:
                    self.pause_and_alert("Confirm failed after 3 retries")
                    break

            # 4. ATTEMPT EXECUTOR — model runs on real app
            result = self.attempt_executor.run(model_id)

            # 5. REAL SCORE CALCULATION
            score = self.score_calculator.calculate(result, model_id)

            # 6. SAVE IF BEST
            if score > self.best_score:
                self.best_score = score
                self.save_best_model()

            # 7. MODEL LEARNS
            self.model.update_weights(result, score)

            # 8. OVERFITTING CHECK (every 10 attempts)
            if self.iteration % 10 == 0:
                self.overfitting_monitor.check()
                self.save_checkpoint()

            # 9. EMIT STATUS
            self.emit_status(self.iteration, score, self.best_score)
```

### Reset Controller (core/reset_controller.py)

```python
class ResetController:
    def execute(self):
        # MASTER RESET: run recorded sequence
        for step in self.reset_sequence:
            self.action_executor.run(step)
        time.sleep(1.5)

    def verify(self):
        # VERIFY: pixel-level checks
        screenshot = self.capture()
        checks = [
            self.check_no_popup(screenshot),
            self.check_heatmap_present(screenshot),
            self.check_not_over_zoomed(screenshot),
            self.check_window_focused(),
        ]
        return all(checks)

    def confirm(self):
        # CONFIRM: compare to goal image
        screenshot = self.capture()
        score = self.goal_matcher.similarity(screenshot)
        return score, score >= self.threshold
```

### Score Calculator (core/score_calculator.py)

```python
class ScoreCalculator:
    def calculate(self, attempt_result, model_id):
        config = self.load_scoring_config(model_id)
        total = 0

        if config.mode == "auto":
            total = self.auto_score(attempt_result)

        elif config.mode == "manual":
            # Layer 1: goal image match
            if config.layer1_enabled:
                match = self.goal_matcher.score(attempt_result.final_screenshot)
                total += match * 0.5 * config.layer1_weight

            # Layer 2: reward rules
            if config.layer2_enabled:
                for rule in config.rewards:
                    if self.rule_triggered(rule, attempt_result):
                        total += rule.points
                for penalty in config.penalties:
                    if self.penalty_triggered(penalty, attempt_result):
                        total -= penalty.points * config.penalty_weight

            # Layer 3: behavior analysis
            if config.layer3_enabled:
                total += self.analyze_behavior(attempt_result)

        # Normalize 0-100
        return min(100, max(0, total))
```

### Checkpoint Manager (core/checkpoint_manager.py)

```python
class CheckpointManager:
    def save(self, reason, trainer_state):
        checkpoint = {
            "attempt":       trainer_state.iteration,
            "best_score":    trainer_state.best_score,
            "score_history": trainer_state.score_history,
            "training_log":  trainer_state.log,
            "stop_reason":   reason,
            "timestamp":     datetime.now().isoformat(),
            "settings":      trainer_state.config,
        }
        # Save state JSON
        path = f"checkpoints/checkpoint_{reason}_{trainer_state.iteration}.json"
        save_json(path, checkpoint)

        # Save model weights
        trainer_state.model.save(f"checkpoints/weights_{trainer_state.iteration}.keras")
        trainer_state.best_model.save("best/weights_best.keras")

    def load(self, checkpoint_path):
        state = load_json(checkpoint_path)
        weights_path = checkpoint_path.replace(".json", ".keras").replace("checkpoint_", "weights_")
        model = load_model(weights_path)
        return state, model
```

---

## ALL 6 MODELS TO BUILD

### Model 1: open_coinglass
```
Task Type:   Yes/No Decision + Sequence of Actions
Output Type: Yes/No + which sequence to run
Screen Region: full screen including taskbar and desktop
Purpose: Is app open? If yes focus it. If no launch it.
Reset sequence: not applicable (this IS the launch model)
```

### Model 2: assess_chart
```
Task Type:   Yes/No Decision + Settings Adjustment
Output Type: Yes/No (ready) + numeric values (threshold, zoom, pan)
Screen Region: full Coinglass window
Purpose: Is chart ready to start clicking? What needs adjusting?
Transfer from: open_coinglass
```

### Model 3: optimize_settings
```
Task Type:   Visual Detection + Settings Adjustment
Output Type: Numeric values for threshold, zoom steps, pan distance
Screen Region: chart canvas + threshold slider area
Purpose: Look at chart density and adjust settings until optimal
Transfer from: assess_chart
```

### Model 4: click_clusters
```
Task Type:   Visual Detection + Click Navigation
Output Type: Ranked click list (x, y, confidence, type, estimated_price)
Screen Region: chart canvas only (no axis, no toolbar)
Purpose: Find all red/purple liquidity zones, click each one
Transfer from: assess_chart (both see similar Coinglass visuals)
```

### Model 5: read_popup
```
Task Type:   Data Extraction
Output Type: Extracted text (price value + dollar value)
Screen Region: popup area only (center-right of chart, ~220×150px)
Purpose: After each click, read price and dollar value from popup
```

### Model 6: detect_chart_ready
```
Task Type:   Yes/No Decision
Output Type: true/false
Screen Region: chart canvas
Purpose: Quick binary check — is heatmap data visible at all?
Fast check that runs before more expensive models
Transfer from: click_clusters
```

---

## MACRO PIPELINE — FINAL FLOW

```
START
  ↓
[open_coinglass]
  ↓
◆ IF chart visible?
  NO  → retry open_coinglass
  YES → continue
  ↓
[detect_chart_ready]
  ↓
◆ IF chart ready?
  NO  → [optimize_settings] → loop back
  YES → continue
  ↓
↺ LOOP until assess_chart confirms ready (max 5)
  → [assess_chart]
  → IF not ready: [optimize_settings]
  ↓
[click_clusters]
  ↓
⟳ FOR EACH cluster in ranked list
  → [read_popup]
  → ◆ IF value > threshold (configurable)
      YES → save to results JSON
      NO  → log only, skip
  ↓
END
  → compile final JSON output
  → save to data/{pair}_{timeframe}.json
```

---

## SCORING SYSTEM — COMPLETE IMPLEMENTATION

### Auto-Score (default, works from attempt 1)
```python
def auto_score(result):
    score = 0
    if result.completed_without_error: score += 40
    if result.output_not_empty:        score += 30
    if result.duration < 60:           score += 20
    if result.goal_match > 0.5:        score += result.goal_match * 10
    return score
```

### Manual Rules (added after observing real training)
Each rule defined by user in Scoring tab:
```python
RewardRule(name="cluster_found", condition="cluster_count > 0", points=10)
RewardRule(name="over_1m",       condition="max_value > 1000000", points=35)
PenaltyRule(name="missed_wall",  condition="missed_large_cluster", points=30)
PenaltyRule(name="too_slow",     condition="duration > 60", points=20)
```

### Behavior Analysis (auto, no config)
```python
def analyze_behavior(result):
    score = 0
    if result.click_spread > 0.5:      score += 15  # covered whole chart
    if result.clicked_largest_first:   score += 20  # good ordering
    if result.no_duplicate_clicks:     score += 10  # efficient
    if result.chart_undamaged:         score += 10  # left chart clean
    return score
```

---

## REWARD / SCORING REFERENCE FOR COINGLASS MODELS

### click_clusters rewards
```
+ Any cluster found:            +10
+ Cluster > 500K USD:           +20
+ Cluster > 1M USD:             +35
+ Cluster > 5M USD:             +60
+ Found biggest wall:           +50 bonus
+ Completed under 30s:          +20
+ Completed under 20s:          +35
+ Clicked largest first:        +15
+ No duplicate clicks:          +10
+ Goal image match (per %):     up to +10
```

### click_clusters penalties
```
- Missed cluster > 1M USD:      -30
- Missed cluster > 5M USD:      -60
- Wrong area click:             -15
- Duplicate click same spot:    -20
- Popup did not appear:         -10
- Over 60 seconds:              -20
- Over 120 seconds:             -40
- Chart broken after:           -30
- App crashed:                  -50
```

---

## DATA AUGMENTATION SETTINGS

```python
augmentation_config = {
    "brightness_range": 0.2,      # ±20%
    "color_jitter": 0.15,          # ±15%
    "zoom_range": 0.1,             # ±10%
    "horizontal_flip": True,
    "rotation_range": 0,           # OFF for charts
    "gaussian_noise": False,       # OFF for charts
}
```

---

## BACKUP SYSTEM

```python
def run_backup():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"{settings.backup_location}/backup_{timestamp}/"

    # Copy everything important
    copy_tree("models/", backup_dir + "models/")
    copy_tree("macros/",  backup_dir + "macros/")
    copy("calibration.json", backup_dir)
    copy("settings.json",    backup_dir)

    # Clean old backups
    keep_last_n_backups(settings.backup_keep_days)
```

---

## DRIFT DETECTION

```python
class DriftDetector:
    def check(self, model_id, recent_runs):
        if len(recent_runs) < 20:
            return None
        avg_confidence = mean([r.confidence for r in recent_runs[-20:]])
        baseline = self.get_baseline_confidence(model_id)
        drop_pct = (baseline - avg_confidence) / baseline

        if drop_pct > settings.drift_threshold:
            return DriftAlert(
                model_id=model_id,
                current_avg=avg_confidence,
                baseline=baseline,
                drop_percent=drop_pct * 100,
                recommendation="Record new videos and retrain"
            )
```

---

## IMPORTANT IMPLEMENTATION NOTES

1. The training loop must run in a separate thread from the UI so the interface never freezes

2. All training state must be persisted to disk after every attempt so crashes never lose progress

3. The attempt executor must handle the case where Coinglass is unresponsive — timeout after X seconds and treat as failed attempt

4. Screen region coordinates must be recalculated relative to current window position every attempt — windows move

5. All file paths must use pathlib not string concatenation for cross-platform safety

6. The live log terminal must use WebSocket or Server-Sent Events for real-time streaming without polling

7. Model weights must be saved in .keras format with full metadata so they can be loaded and resumed perfectly

8. The test set (5%) must be locked at compile time and never used for any training decision — only final evaluation

9. Label Tool must show the confidence level of auto-detected labels so user knows which ones to review first

10. Macro Dry Run must be interruptible — pressing Pause during dry run must freeze execution at current node

---

## OUTPUT JSON FORMAT

Every agent run saves to data/{PAIR}_{TIMEFRAME}.json:

```json
{
  "pair": "XRPUSDT",
  "timeframe": "15m",
  "current_price": 1.3777,
  "timestamp": "2026-03-18T14:32:00Z",
  "agent_version": "coinglass_full_agent_v3",
  "duration_seconds": 8.3,
  "attempts_made": 1,

  "short_liquidations": [
    { "price": 1.3820, "value_str": "2.3M", "usd": 2300000, "confidence": 0.91 },
    { "price": 1.3800, "value_str": "2.2M", "usd": 2200000, "confidence": 0.87 }
  ],

  "long_liquidations": [
    { "price": 1.3630, "value_str": "4.1M", "usd": 4100000, "confidence": 0.94 },
    { "price": 1.3560, "value_str": "2.8M", "usd": 2800000, "confidence": 0.88 }
  ],

  "strongest_wall": {
    "side": "long",
    "price": 1.3630,
    "usd": 4100000
  },

  "model_confidence": {
    "open_coinglass": 0.99,
    "assess_chart": 0.88,
    "click_clusters": 0.91,
    "read_popup": 0.94
  }
}
```

---

## BUILD THIS IN THIS ORDER

1. Project setup, file structure, design tokens
2. NavBar component with all nav items, dots, badges, expand/collapse
3. Dashboard screen with model cards and terminal
4. Traffic light overlay component
5. Model creation modal
6. Data tab — drop zone, extraction, preprocessing, augmentation, health check
7. Label tab — auto-label, review progress, compile
8. Actions tab — live recorder, sequences, manual steps, conditional logic
9. Reset tab — Master Reset, Verify, Confirm sections
10. Train tab — all modes, live monitor, overfitting, scheduler
11. Scoring tab — auto-score, all 3 layers, curriculum, thresholds
12. Goals tab — drop zone, similarity threshold, confidence heatmap
13. Results tab — versions, comparison, error analysis, test model, replays, drift
14. Macro Builder — flowchart canvas, all node types, properties panel, dry run
15. Settings screen — all settings including backup and scheduler
16. Backend API stubs (return mock data initially)
17. Connect frontend to backend
18. Implement real training loop
19. Implement reset controller
20. Implement attempt executor
21. Implement score calculator
22. Implement all remaining backend systems

---

END OF SPECIFICATION
