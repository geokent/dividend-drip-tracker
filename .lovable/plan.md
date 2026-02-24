

# Make DividendCoach More Discoverable

## Approach
Combine two strategies: auto-open on first visit and a tooltip nudge on subsequent visits.

## Changes to `src/components/DividendCoach.tsx`

### 1. Auto-open on first dashboard visit
- On mount, check `localStorage` for a `dividendCoachSeen` flag
- If not set, automatically open the chat panel and set the flag
- On subsequent visits, the panel stays closed by default

### 2. Tooltip nudge on return visits
- When the floating button is visible (panel closed) and the user has visited before, show a small speech-bubble tooltip next to the button
- Text: "Need portfolio help? Ask me!"
- Auto-dismiss after 5 seconds, with a small fade-out animation
- Track dismissal in `localStorage` so it only shows once per session (use `sessionStorage`) or a limited number of times

### 3. Enhanced button styling
- Replace `animate-pulse` with a more eye-catching glow effect using a `shadow-primary/50` and a subtle scale animation
- Add a small gradient or ring to make it pop against the dashboard background

## Technical Details

**State additions:**
```text
const [showNudge, setShowNudge] = useState(false)
```

**localStorage keys:**
- `dividendCoachSeen` — permanent flag for first-visit auto-open
- `sessionStorage: coachNudgeDismissed` — per-session flag for tooltip

**useEffect logic (on mount):**
```text
if (!localStorage.getItem('dividendCoachSeen')) {
  setIsOpen(true);
  localStorage.setItem('dividendCoachSeen', 'true');
} else if (!sessionStorage.getItem('coachNudgeDismissed')) {
  setShowNudge(true);
  setTimeout(() => {
    setShowNudge(false);
    sessionStorage.setItem('coachNudgeDismissed', 'true');
  }, 5000);
}
```

**Tooltip bubble markup** (shown when `showNudge && !isOpen`):
- Absolutely positioned above the floating button
- Small card with arrow pointer, background blur
- "Need portfolio help? Ask me!" text
- Click on it opens the chat and dismisses the nudge

**Button style upgrade:**
- Change from `animate-pulse` to a custom glow: `shadow-[0_0_15px_rgba(var(--primary),0.4)]` with a gentle scale keyframe
- Add `ring-2 ring-primary/30` for extra visibility

## Files Modified

| File | Change |
|------|--------|
| `src/components/DividendCoach.tsx` | Add auto-open logic, tooltip nudge, enhanced button styling |
| `tailwind.config.ts` | Add `glow` keyframe/animation (optional, can use inline styles) |

