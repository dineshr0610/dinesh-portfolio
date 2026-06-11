# TODO

## Task: Premium cinematic header fixes (avatar + contact + nav styling)

### Step 1 — Inspect & patch avatar circular crop
- [ ] Update `app/components/ProfileImage.vue`:
  - Ensure avatar wrapper enforces square shape + clipping (`aspect-square`, `overflow-hidden`, `rounded-full`).
  - Keep `<img>` using `w-full h-full object-cover object-center`.

### Step 2 — Remove duplicate Contact button
- [ ] Update `app/components/Header.vue`:
  - Remove the extra Desktop actions `Contact` CTA button.
  - Keep nav Contact link only.

### Step 3 — Unify desktop nav link styling
- [ ] Update `app/components/Header.vue`:
  - Replace remaining `hover:underline` classes in the Desktop nav with the existing `.nav-link` class (Home/About/Achievements/Timeline/Gallery).
  - Apply same consistent treatment to the Dinesh Now control.

### Step 4 — Verify
- [ ] Run build / lint / typecheck.
- [ ] Visual check:
  - Avatar crops into perfect circle (rectangular images centered).
  - Only one Contact link appears in desktop header.
  - Desktop nav hover/active styles are consistent.

