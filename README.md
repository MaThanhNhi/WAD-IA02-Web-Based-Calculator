# Windows 11 Basic Mode Calculator

A web-based calculator that replicates the Basic Mode functionality of the Windows 11 Calculator application.

## 🎯 Project Overview

This project implements a fully functional web-based calculator using raw HTML5, CSS3 (Tailwind CSS via CDN), and ES6+ JavaScript, following the immediate execution model of the Windows 11 Basic Mode calculator.

## ✨ Features

### Core Arithmetic Operations
- **Addition** (+)
- **Subtraction** (−)
- **Multiplication** (×)
- **Division** (÷)

### Special Functions
- **Square Root** (√) - Calculates square root with negative number validation
- **Square** (x²) - Calculates square of current value
- **Reciprocal** (1/x) - Calculates reciprocal with division by zero protection
- **Percentage** (%) - Context-dependent percentage calculations:
  - Addition/Subtraction: A ± B% = A ± (A × B/100)
  - Multiplication/Division: A × B% = A × (B/100)
- **Negate** (±) - Toggles sign of current value

### Control Functions
- **Clear** (C) - Resets entire calculator state
- **Clear Entry** (CE) - Clears current input only
- **Backspace** (←) - Deletes last character

### User Interface
- **Dual Display** - History display (top) and main result display (bottom)
- **History Panel** - Windows 11 style side panel showing completed calculations
  - View all previous calculations
  - Click to reuse results
  - Clear history functionality
  - Persistent storage (survives page refresh)
- **Dark/Light Theme Toggle** - Beautiful dark purple theme as default
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Keyboard Support** - Full keyboard input support
- **Windows 11 Styling** - Matches Windows 11 calculator aesthetic
- **Accessibility** - ARIA labels and keyboard navigation

## 🏗️ Architecture

### Immediate Execution Model
The calculator follows the immediate execution model (left-to-right evaluation), NOT standard PEMDAS/BODMAS:
- `1 + 2 × 3 = 9` (calculates as (1+2)×3, not 1+(2×3))
- Operations execute immediately when the next operator is pressed

### File Structure
```
IA02 - Web-based Calculator/
├── index.html              # Main HTML file with Tailwind CSS CDN
├── css/
│   └── custom.css          # Custom styles and animations
├── js/
│   ├── calculator.js       # Core calculation engine
│   └── ui.js               # UI controller and event handlers
├── IMPLEMENTATION_PLAN.md  # Detailed implementation checklist
└── README.md               # This file
```

### Separation of Concerns
- **HTML** - Structure and semantic markup
- **CSS** - Presentation and responsive design (Tailwind + custom)
- **JavaScript** - Application logic separated into:
  - `calculator.js` - Pure calculation logic (no DOM manipulation)
  - `ui.js` - UI event handling and display updates

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari)
- No build tools required - uses Tailwind CSS Play CDN

### Installation
1. Clone or download this repository
2. Open `index.html` in a web browser
3. Start calculating!

### Keyboard Shortcuts
- **0-9** - Number input
- **.** - Decimal point
- **+, -, *, /** - Operators
- **Enter** or **=** - Equals
- **Escape** - Clear (C)
- **Backspace** - Delete last character
- **%** - Percentage

## 🧪 Testing

### Critical Test Cases

| Test ID | Input Sequence | Expected Output | Feature Tested |
|---------|---------------|-----------------|----------------|
| TC-01 | 1 + 2 × 3 = | 9 | Immediate execution |
| TC-02 | 20 ÷ 5 × 2 = | 8 | Operator chaining |
| TC-03 | 400 + 15% | 460 | Additive percentage |
| TC-04 | 150 - 20% | 120 | Subtractive percentage |
| TC-05 | 10 + 50, CE, 2 = | 12 | Clear Entry state |
| TC-06 | √9 | 3 | Square root |
| TC-07 | 5 ÷ 0 | Error | Division by zero |
| TC-08 | 0.1 + 0.2 | 0.3 | Floating point |

### Browser Compatibility
Tested on:
- Google Chrome (latest)
- Microsoft Edge (latest)
- Mozilla Firefox (latest)
- Safari (latest)

## 📐 Technical Specifications

### Precision
- Internal: IEEE 754 double-precision (64-bit)
- Display: Maximum 16 significant digits
- Scientific notation for values > 10^15 or < 10^-6

### Performance
- UI response: < 50ms for all operations
- Arithmetic execution: Sub-millisecond
- DOM updates: Optimized to prevent jank

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatible

## 🎨 Design

The calculator closely replicates the Windows 11 Basic Mode aesthetic:
- Clean, modern interface
- Segoe UI font family
- Windows 11 color scheme
- Smooth animations and transitions
- Responsive layout with proper touch targets

## 📱 Responsive Design

The calculator adapts to different screen sizes:
- **Desktop** (>768px) - Full-size calculator with optimal spacing
- **Tablet** (641px-768px) - Adjusted button sizes
- **Mobile** (<640px) - Compact layout with larger touch targets (44×44px minimum)

## 🔧 Technology Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (via Play CDN)
- **JavaScript (ES6+)** - Modern JavaScript features
- **Git** - Version control

## 📚 Documentation

For complete project documentation, see:
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed 2-day development checklist
- [Specification Document](docs/) - Full functional and non-functional specifications

## 🤖 AI Assistance

This project was developed with AI assistance for:
- UI scaffolding and Tailwind CSS implementation
- Core calculation logic review and debugging
- Documentation generation
- Test case development

All AI-generated content has been reviewed, tested, and verified for accuracy.

## 👤 Author

**Student ID**: 22120256
**Project**: IA02 - Web-Based Calculator
**Course**: Web Development (HCMUS)

## 📄 License

This project is submitted as part of academic coursework.

## 🙏 Acknowledgments

- Windows 11 Calculator team for design inspiration
- Tailwind CSS team for the excellent utility framework
- HCMUS Web Development course instructors

---

**Note**: This calculator implements the Windows 11 Basic Mode behavior exactly, including the immediate execution model and context-dependent percentage calculations. It does NOT follow standard mathematical operator precedence (PEMDAS/BODMAS).
