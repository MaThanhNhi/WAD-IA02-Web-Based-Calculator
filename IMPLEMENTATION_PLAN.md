# Windows 11 Basic Mode Calculator Implementation Plan (2-Day Timeline)

> **Note**: Tasks can be marked as complete by replacing `[ ]` with `[X]` in this markdown document.

## Day 1: Project Setup, UI Implementation & Core Logic

### Morning: Project Setup and UI Framework (3-4 hours)

- [X] **Initialize project folder structure**
  - [X] Create `index.html` as the main entry point
  - [X] Create `js/calculator.js` for calculator logic
  - [X] Create `js/ui.js` for UI interactions
  - [X] Create `css/custom.css` for additional custom styles

- [X] **Configure Tailwind CSS using Play CDN**
  - [X] Add Tailwind CDN script to HTML head
  - [X] Configure custom Tailwind configuration inline
  - [X] Set up viewport meta tag for responsiveness

- [X] **Create Git repository**
  - [X] Initialize with `git init`
  - [X] Set up `.gitignore` file
  - [ ] Make initial commit with project structure

- [X] **Implement calculator container and display**
  - [X] Create responsive calculator wrapper with proper styling
  - [X] Implement history display area (smaller text above)
  - [X] Implement main result display with larger text
  - [X] Ensure text alignment matches Windows 11 (right-aligned)
  - [X] Add proper shadows and borders for Windows 11 aesthetic

### Afternoon: Complete UI & Begin Core Logic (4-5 hours)

- [X] **Complete calculator UI**
  - [X] Design calculator keypad grid (4×5 layout)
  - [X] Create number buttons (0-9) with consistent styling
  - [X] Create operation buttons (+, -, ×, ÷) with accent styling
  - [X] Create special function buttons (%, √, ±)
  - [X] Create control buttons (CE, C, ←, =)
  - [X] Implement button hover and active states
  - [X] Ensure proper spacing and sizing

- [X] **Begin calculator logic implementation**
  - [X] Define CalculatorEngine class structure
  - [X] Define state variables (accumulator, currentInput, pendingOperator, history)
  - [X] Implement number input handling (digits 0-9)
  - [X] Implement decimal point input with validation
  - [X] Prevent multiple decimals in one number
  - [X] Add basic display update methods

- [X] **Connect UI to logic layer**
  - [X] Add event listeners for button clicks
  - [X] Implement display update functions
  - [X] Test basic number input display

### Evening: Core Logic Continuation (3-4 hours)

- [X] **Complete core arithmetic logic**
  - [X] Implement addition operation
  - [X] Implement subtraction operation
  - [X] Implement multiplication operation
  - [X] Implement division operation with zero check
  - [X] Implement immediate execution model (left-to-right evaluation)
  - [X] Handle calculation display updates
  - [X] Update history display with ongoing calculation

- [X] **Implement special functions**
  - [X] Implement square root function
  - [X] Add validation for negative square root
  - [X] Implement negation (±) function
  - [X] Implement context-dependent percentage functionality:
    - [X] Addition context: A + B% → A + (A × B/100)
    - [X] Subtraction context: A - B% → A - (A × B/100)
    - [X] Multiplication context: A × B% → A × (B/100)
    - [X] Division context: A ÷ B% → A ÷ (B/100)

- [X] **Implement control functions**
  - [X] Clear (C) to reset all state variables
  - [X] Clear Entry (CE) to reset only current input
  - [X] Backspace (←) to remove last digit from current input
  - [X] Equals (=) handling with proper state updates
  - [X] Handle repeated equals pressing

## Day 2: Feature Completion, Testing & Deployment

### Morning: Feature Completion (4-5 hours)

- [X] **Implement keyboard support**
  - [X] Map number keys (0-9) to corresponding buttons
  - [X] Map decimal point (.) to decimal button
  - [X] Map operators (+, -, *, /) to corresponding functions
  - [X] Map Enter key to equals function
  - [X] Map Escape key to clear function
  - [X] Map Backspace key to backspace function
  - [X] Add visual feedback for keyboard interaction
  - [X] Prevent default browser behaviors

- [X] **Handle edge cases**
  - [X] Division by zero error handling and display
  - [X] Negative number square root validation
  - [X] Large number display handling (16 significant digits)
  - [X] Scientific notation for numbers exceeding threshold
  - [X] Multiple operation chaining edge cases
  - [X] Floating-point precision handling
  - [X] Input length limiting

- [X] **Implement responsive behavior**
  - [X] Test on desktop viewport (1920×1080)
  - [X] Test on tablet viewport (768×1024)
  - [X] Test on mobile viewport (375×667)
  - [X] Ensure minimum touch target size (44×44px)
  - [X] Verify no horizontal scrolling on mobile
  - [X] Test landscape and portrait orientations

### Afternoon: Testing & Bug Fixing (4-5 hours)

- [ ] **Execute critical test cases from specification**
  - [ ] TC-01: Test 1 + 2 × 3 = 9 (Immediate execution)
  - [ ] TC-02: Test 20 ÷ 5 × 2 = 8 (Immediate execution chain)
  - [ ] TC-03: Test 400 + 15% = 460 (Additive percentage)
  - [ ] TC-04: Test 150 - 20% = 120 (Subtractive percentage)
  - [ ] TC-05: Test 10 + 50 then CE then 2 = 12 (CE state persistence)
  - [ ] TC-06: Test 1234 then ← then C = 0 (Backspace then clear)
  - [ ] TC-07: Test 0.1 + 0.2 ≈ 0.3 (Floating point handling)
  - [ ] TC-08: Test 5 ÷ 0 = Error (Division by zero)
  - [ ] TC-09: Test 3 + 3 = then + 4 = 10 (Chained operations)
  - [ ] TC-10: Test √9 = 3 (Square root)
  - [ ] TC-11: Test √-1 = Error (Invalid square root)
  - [ ] TC-12: Test 72 - 20% + 5% = 60.48 (Chained percentage)

- [ ] **Cross-browser testing**
  - [ ] Test on Google Chrome (latest)
  - [ ] Test on Microsoft Edge (latest)
  - [ ] Test on Mozilla Firefox (if available)
  - [ ] Test on mobile browsers

- [ ] **Bug fixing and refinement**
  - [ ] Address any issues found during testing
  - [ ] Refine UI elements as needed
  - [ ] Optimize code and remove console logs
  - [ ] Verify all acceptance criteria (AC-A.1 through AC-U.3)
  - [ ] Check ARIA attributes for accessibility
  - [ ] Verify keyboard focus indicators

### Evening: Documentation & Deployment (3-4 hours)

- [ ] **Create comprehensive documentation**
  - [ ] Write Functional Specifications (F-SPEC)
  - [ ] Write Non-Functional Specifications (N-SPEC)
  - [ ] Define Acceptance Criteria (AC)
  - [ ] Document Testing Plan and results
  - [ ] Create test case results table

- [ ] **Document AI assistance**
  - [ ] List specific prompts used for code generation
  - [ ] Document prompts for UI design assistance
  - [ ] Document prompts for debugging help
  - [ ] Explain how AI helped in development process
  - [ ] Reflect on learnings from AI integration
  - [ ] Discuss challenges with immediate execution model
  - [ ] Discuss percentage logic implementation

- [ ] **Code cleanup and finalization**
  - [ ] Review all code for readability
  - [ ] Add comprehensive comments
  - [ ] Ensure consistent code style
  - [ ] Verify separation of concerns (HTML/CSS/JS)
  - [ ] Check modular architecture
  - [ ] Optimize performance

- [ ] **Deployment to GitHub Pages**
  - [ ] Create GitHub repository
  - [ ] Push all code to repository
  - [ ] Configure GitHub Pages in repository settings
  - [ ] Set source branch to main/master
  - [ ] Test deployed application thoroughly
  - [ ] Verify all features work on live site

- [ ] **Final review and submission**
  - [ ] Review all documentation for completeness
  - [ ] Verify deployment link is accessible
  - [ ] Add deployment link to documentation
  - [ ] Package source code and documentation in ZIP
  - [ ] Final proofreading of documentation
  - [ ] Submit final deliverables

## Implementation Checkpoints

### Day 1 Checkpoint (End of Day)
- ✓ Project structure created with all files
- ✓ Tailwind CSS configured via Play CDN
- ✓ Complete UI implemented with Windows 11 styling
- ✓ Dark purple theme implemented with theme toggle
- ✓ Basic number input working
- ✓ Core arithmetic operations functional
- ✓ Immediate execution model working
- ✓ Special functions (√, x², 1/x, ±, %) implemented
- ✓ Control keys (C, CE, ←) working

### Day 2 Mid-Day Checkpoint
- ✓ Keyboard support fully implemented
- ✓ All edge cases handled
- ✓ Responsive design verified
- ✓ **History Panel feature implemented** (Windows 11 style)
- ⏳ All critical test cases passing (needs manual testing)
- ⏳ Cross-browser testing completed (needs testing)

### Day 2 Final Checkpoint (End of Day)
- ✓ All documentation completed
- ✓ AI assistance documented with reflection
- ✓ Code cleaned and commented
- ✓ Deployed to GitHub Pages
- ✓ Final testing on live site successful
- ✓ Submission package ready

## Key Technical Requirements Summary

### Immediate Execution Model
- Must calculate left-to-right: 1 + 2 × 3 = 9 (not 7)
- Each operator triggers immediate calculation of pending operation

### Percentage Logic
- **Addition/Subtraction**: A ± B% = A ± (A × B/100)
- **Multiplication/Division**: A × B% = A × (B/100)

### State Management
- **Accumulator**: Stores result of previous operations
- **Current Input**: Current number being entered (string buffer)
- **Pending Operator**: Operation waiting to be executed
- **Calculation History**: Display string above result

### Control Keys
- **C (Clear)**: Reset all state, display = "0"
- **CE (Clear Entry)**: Reset current input only, preserve state
- **← (Backspace)**: Delete last character of current input only

### Display Requirements
- Maximum 16 significant digits
- Scientific notation for overflow
- History display above main result
- Right-aligned text
- Error messages for invalid operations

## Grading Rubric Focus Areas

1. **Source Code Quality (25%)** - Modular, readable, well-structured
2. **Functional Specifications (15%)** - Complete feature documentation
3. **Non-Functional Specifications (10%)** - Performance, usability, accessibility
4. **Acceptance Criteria (10%)** - Clear, testable criteria
5. **Testing Plan (10%)** - Comprehensive test cases with results
6. **Public Hosting (10%)** - GitHub Pages deployment
7. **Prompt Engineering (10%)** - AI assistance documentation
8. **Documentation Quality (10%)** - Professional presentation

---

**Total Estimated Time**: 22-28 hours over 2 days (11-14 hours per day)

This aggressive timeline requires focused implementation and efficient use of AI assistance for scaffolding and debugging.
