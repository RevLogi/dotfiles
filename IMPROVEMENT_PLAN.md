# Workflow Improvement Plan

> A comprehensive roadmap for automating and improving your dotfiles workflow

**Last Updated:** January 12, 2026
**Target Setup:** M1 MacBook Air + M1 Mac Mini
**Usage Pattern:** Bi-weekly machine switching (weekday MacBook Air, weekend Mac Mini)
**Current Projects:** CS61C + Text Editor Development

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Current State Analysis](#current-state-analysis)
- [High Priority Recommendations](#high-priority-recommendations)
- [Medium Priority Recommendations](#medium-priority-recommendations)
- [Bonus Improvements](#bonus-improvements)
- [Implementation Phases](#implementation-phases)
- [Expected Benefits](#expected-benefits)
- [Implementation Order](#implementation-order)

---

## Executive Summary

Based on analyzing your dotfiles repository and current workflow, this document outlines a comprehensive automation plan designed for your specific needs:

- **Full automation** - Hands-off machine switching and maintenance
- **CS61C support** - Professional C/C++ debugging and analysis toolkit
- **Text editor development** - Rust-based editor with automated testing
- **Multi-machine workflow** - Seamless switching between MacBook Air and Mac Mini

**Total Implementation Time:** ~16 hours over 4 weeks (4 hours/week)

---

## Current State Analysis

### ✅ Strengths

1. **Well-documented** - Comprehensive README.md with clear sections
2. **Reproducible setup** - Brewfile, GNU Stow, and Git provide consistent installation
3. **Good practices** - Conventional commit messages, clear branching strategy
4. **Active maintenance** - Recent commits show regular updates (5 commits today)
5. **Modern tools** - Using lazy.nvim, TPM, Zim Framework
6. **Multi-machine ready** - Has defined workflow for syncing
7. **Identical hardware** - M1 MacBook Air + M1 Mac Mini (same tool compatibility)
8. **CloudDocs integration** - Automatic sync of course work

### ❌ Critical Gaps

1. **Zero automation** - No scripts, git hooks, or scheduled tasks
2. **Manual sync required** - Must remember to `git pull` and `stow -R` when switching machines
3. **No validation** - Can push broken configurations to GitHub
4. **No testing** - Cannot verify configs work before committing
5. **Single environment** - No separation between personal/work machines
6. **Manual backups** - Monthly git tags require manual execution
7. **No changelog** - Difficult to track what changed between versions
8. **Repetitive tasks** - Weekly/monthly maintenance runs manually
9. **Missing CS61C tools** - No gdb, lldb, valgrind, sanitizers
10. **Missing editor dev tools** - No Rust toolchain, testing frameworks
11. **Inconsistent paths** - "c" alias points to Downloads, but courses are in CloudDocs

---

## High Priority Recommendations

### 1. Add `scripts/` Directory with Helper Scripts

Create shell scripts for common operations to reduce manual work and errors.

**Directory Structure:**
```bash
scripts/
├── sync.sh              # Quick sync on machine wake
├── backup.sh            # Create git backup tags
├── update.sh            # Run all weekly maintenance
├── health.sh            # Validate all configurations
├── test.sh             # Run all tests
├── pre-shutdown.sh      # Auto-commit before shutdown
├── text-editor-dev.sh   # Text editor development workflow
└── cs61c-tools.sh      # CS61C helper functions
```

**Benefits:**
- One-command operations
- Less error-prone
- Documented and repeatable processes
- Can be automated with launchd

**Estimated Time:** 2 hours

---

### 2. Add Pre-Commit Hook for Validation

Create `.git/hooks/pre-commit` to catch errors before pushing to GitHub.

**Purpose:** Validate configurations are syntactically correct before committing

**What it checks:**
- Zsh syntax (`zsh -n`)
- Neovim config (`nvim --headless -c "lua require('lazy').check()"`)
- Tmux syntax (`tmux -f tmux/.tmux.conf show-options`)
- Brewfile validity (`brew bundle check`)

**Benefits:**
- Prevent broken configs from being pushed
- Catch errors before they propagate to other machines
- Professional development workflow

**Estimated Time:** 30 minutes

---

### 3. Add Quick-Sync Function to Zsh

Add to `zsh/.zshrc`:

```bash
function dotfiles-sync() {
  cd ~/dotfiles
  git pull origin main
  stow -R -t ~ zsh nvim tmux vim kitty 2>/dev/null || true
  source ~/.zshrc
  echo "✅ Dotfiles synced!"
}
```

**Benefits:**
- Single command to sync everything
- Faster than manual git commands
- Easy to remember

**Estimated Time:** 10 minutes

---

## Medium Priority Recommendations

### 4. Add Machine-Specific Configs

Create separate environment configurations for MacBook Air vs Mac Mini.

**Directory Structure:**
```bash
local/                     # Machine-specific (gitignored)
├── macbook-air.zshrc    # MacBook Air specific
├── mac-mini.zshrc        # Mac Mini specific
├── cs61c.zshrc         # CS61C specific
└── work.zshrc           # Work aliases, env vars
```

**Integration in `.zshrc`:**
```bash
# Source machine-specific configs if they exist
[ -f ~/dotfiles/local/macbook-air.zshrc ] && source ~/dotfiles/local/macbook-air.zshrc
[ -f ~/dotfiles/local/mac-mini.zshrc ] && source ~/dotfiles/local/mac-mini.zshrc
[ -f ~/dotfiles/local/cs61c.zshrc ] && source ~/dotfiles/local/cs61c.zshrc
```

**Benefits:**
- Separation of concerns
- Machine-specific settings without conflicts
- Easier collaboration
- Cleaner main configuration

**Estimated Time:** 1 hour

---

### 5. Automate Weekly Updates with Launchd

Create macOS launchd agents for scheduled maintenance.

**File:** `~/Library/LaunchAgents/com.user.dotfiles-weekly.plist`

**Schedule:** Every Sunday at 2 AM (non-disruptive)

**Tasks:**
- Update Homebrew packages (`brew update && brew upgrade`)
- Update Neovim plugins (`nvim +Lazy sync`)
- Update Tmux plugins (`~/.tmux/plugins/tpm/bin/update_plugins all`)
- Run health checks (`scripts/health.sh`)
- Clean old branches (`git branch -vv | grep ': gone]'`)
- Create backup tag (`git tag backup-$(date +%Y%m%d)`)

**Benefits:**
- Never forget maintenance tasks
- System remains up-to-date
- Automated cleanup
- Regular backups

**Estimated Time:** 2 hours

---

### 6. Add CHANGELOG.md

Track meaningful changes over time.

**Format:**
```markdown
## [2026-01-12]
- Added Brewfile for package management
- Removed starship, switched to asciiship
- Added comprehensive README

## [2026-01-10 - Mac Mini]
- Created CS61C project structure
- Updated nvim LSP for C/C++

## [2025-12-21]
- Migrated from oh-my-zsh to Zim Framework
- Added tmux configuration with plugins
```

**Benefits:**
- Better version tracking
- Easier rollback decisions
- Communication of changes
- Historical reference

**Estimated Time:** 15 minutes (ongoing)

---

## Bonus Improvements

### B1. Add More Zsh Aliases

Enhance your existing aliases with dotfile management and quick access.

```bash
# Dotfile management
alias dfl='cd ~/dotfiles && git pull'
alias dfs='dotfiles-sync'  # sync function from recommendation #3
alias dft='nvim +checkhealth +qa'

# Quick updates
alias update-neovim='nvim +Lazy sync +qa'
alias update-tmux='~/.tmux/plugins/tpm/bin/update_plugins all'
alias update-all='~/dotfiles/scripts/update.sh'

# Quick configs
alias cfg-nvim='nvim ~/dotfiles/nvim/.config/nvim/init.lua'
alias cfg-tmux='nvim ~/dotfiles/tmux/.tmux.conf'
alias cfg-zsh='nvim ~/dotfiles/zsh/.zshrc'

# CS61C quick access (FIX PATH ISSUE)
alias cs61c="cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/code/cs61c"

# Debug CS61C labs
alias cs61c-debug='valgrind --leak-check=full --show-leak-kinds=all'

# Compile with sanitizers
alias cs61c-compile='gcc -Wall -Wextra -fsanitize=address -fsanitize=undefined -g'

# Run tests
alias cs61c-test='make test && valgrind ./test'

# Machine identification
alias mba="uname -n | grep -q 'MacBook-Air' && echo 'On MacBook Air'"
alias mm="uname -n | grep -q 'Mac-mini' && echo 'On Mac Mini'"
```

**Benefits:**
- Faster common operations
- Fixed path issue with CS61C courses
- Quick access to configuration files
- One-command updates

**Estimated Time:** 15 minutes

---

### B2. Add README Quick Reference Section

Add a "Quick Reference" section to the top of README.md.

```markdown
## Quick Reference

```bash
# Sync all configs
cd ~/dotfiles && git pull && stow -R -t ~ zsh nvim tmux vim kitty

# Update everything
~/dotfiles/scripts/update.sh

# Check system health
~/dotfiles/scripts/health.sh

# New machine setup
./scripts/install.sh
```
```

**Benefits:**
- Instant access to common commands
- New user friendly
- Reduces documentation browsing time

**Estimated Time:** 10 minutes

---

### B3. Add `.editorconfig`

Standardize file formatting across editors.

**File:** `.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.lua]
indent_style = space
indent_size = 2

[*.sh]
indent_style = space
indent_size = 2

[*.vim]
indent_style = tab

[*.py]
indent_style = space
indent_size = 4
```

**Benefits:**
- Consistent formatting across editors
- Automatic indentation
- Team collaboration friendly
- Reduces formatting debates

**Estimated Time:** 10 minutes

---

## Implementation Phases

### Phase 1: Foundation - Week 1
*Goal: Basic automation and validation*

**Tasks:**
1. ✅ Create `scripts/` directory with basic helpers (2 hours)
2. ✅ Add pre-commit hook for validation (30 minutes)
3. ✅ Add git hooks for sync automation (1 hour)
4. ✅ Create post-merge/post-rewrite hooks (30 minutes)
5. ✅ Add `dotfiles-sync` function to zsh (10 minutes)

**Total Time:** ~4 hours

---

### Phase 2: Machine Switching - Week 2
*Goal: Hands-off machine synchronization*

**Tasks:**
1. ✅ Create launchd agent for auto-sync on wake (2 hours)
2. ✅ Create pre-shutdown hook and agent (1 hour)
3. ✅ Test full machine switch workflow (1 hour)

**Total Time:** ~4 hours

---

### Phase 3: CS61C Support - Week 3
*Goal: Professional C/C++ development environment*

**Tasks:**
1. ✅ Add CS61C tools to Brewfile (30 minutes)
2. ✅ Create cs61c.lua LSP config for Neovim (1 hour)
3. ✅ Add CS61C helper functions to zsh (1 hour)
4. ✅ Test CS61C workflow (30 minutes)

**Tools to Add to Brewfile:**
```ruby
# CS61C Development Tools
brew "gdb"                    # GNU Debugger
brew "lldb"                   # LLVM Debugger
brew "valgrind"               # Memory analysis tool
brew "check"                   # C unit testing framework
brew "cppcheck"                # Static code analysis
```

**Total Time:** ~3 hours

---

### Phase 4: Text Editor Development - Week 4
*Goal: Rust-based editor with automated testing*

**Tasks:**
1. ✅ Add Rust development tools to Brewfile (30 minutes)
2. ✅ Create rust.lua LSP config (1 hour)
3. ✅ Create text-editor-dev.sh script (1 hour)
4. ✅ Set up weekly launchd agents (1 hour)
5. ✅ Create install.sh for new machines (30 minutes)

**Tools to Add to Brewfile:**
```ruby
# Text Editor Development (Build Your Own Text Editor)
brew "rust"                   # Rust toolchain
brew "rust-analyzer"          # Rust language server
```

**Neovim LSP Config Update:**
```lua
servers = {
  'lua_ls',
  'ts_ls',
  'jsonls',
  'pyright',
  'vimls',
  'clangd',
  'rust_analyzer',            -- Add for text editor project
}
```

**Total Time:** ~4 hours

---

## Expected Benefits

### Before Implementation

- ❌ **5+ minutes** to switch machines (manual sync)
- ❌ Risk of broken configurations
- ❌ Manual CS61C tooling setup
- ❌ Forgetting to push/pull changes
- ❌ Time-consuming maintenance tasks
- ❌ No automated backups
- ❌ Repetitive manual commands
- ❌ Path confusion with CS61C projects

### After Implementation

- ✅ **0 seconds** - Terminal always ready (auto-sync on wake)
- ✅ **Protected** - Pre-commit hooks catch errors
- ✅ **Professional** - Full CS61C tooling ready
- ✅ **Automated** - Never forget to sync (hooks + launchd)
- ✅ **Zero maintenance** - Weekly tasks run automatically
- ✅ **Safe** - Automatic backups before changes
- ✅ **Productive** - Quick access functions for common tasks
- ✅ **Reproducible** - 5-minute new machine setup
- ✅ **Organized** - Clear project paths for CS61C
- ✅ **Validated** - Pre-commit ensures configs work

---

## Implementation Order

### Quick Wins (Under 1 hour total)

**Priority 1:** Add `dotfiles-sync` function to zsh (10 minutes)
**Priority 2:** Fix CS61C path in "c" alias (2 minutes)
**Priority 3:** Add more zsh aliases for common operations (15 minutes)
**Priority 4:** Add `.editorconfig` (10 minutes)
**Priority 5:** Add CHANGELOG.md (15 minutes)

**Total:** ~52 minutes
**Impact:** Immediate productivity improvement

---

### Week 1: Foundation (4 hours)

**Day 1-2:** Create `scripts/` directory
- `sync.sh`
- `health.sh`
- `backup.sh`

**Day 3:** Add pre-commit hook
- Validate configs

**Day 4-5:** Add git hooks for automation
- post-merge (auto-restow)
- post-rewrite (auto-restow)
- pre-push (auto-pull)

**Day 5:** Add `dotfiles-sync` function

---

### Week 2: Machine Switching (4 hours)

**Day 1-2:** Create launchd agents
- Sync on wake
- Sync on login

**Day 3:** Create pre-shutdown automation
- Auto-commit before shutdown
- Push to GitHub

**Day 4-5:** Test full workflow
- MacBook Air → Mac Mini
- Mac Mini → MacBook Air

---

### Week 3: CS61C Support (3 hours)

**Day 1:** Add CS61C tools to Brewfile
- gdb, lldb, valgrind

**Day 2:** Create cs61c.lua Neovim config
- C/C++ language server
- Debugger integration

**Day 3:** Add CS61C helper functions
- Quick aliases
- Debug workflows

**Day 4:** Test CS61C workflow
- Debug a lab
- Use sanitizers

---

### Week 4: Text Editor Dev + Full Automation (4 hours)

**Day 1:** Add Rust tools to Brewfile
- Rust toolchain
- rust-analyzer

**Day 2:** Create rust.lua Neovim config
- Rust LSP setup
- Cargo commands

**Day 3:** Create text-editor-dev.sh
- Automated testing
- Watch mode

**Day 4:** Set up weekly launchd
- Sunday maintenance
- Daily health checks

**Day 5:** Create install.sh
- One-command setup
- Test on clean machine

---

## Questions for Customization

Before implementing, consider these questions to tailor the plan:

### CS61C Specifics

1. **What kind of labs are you working on?**
   - Assembly programming?
   - Cache simulation?
   - Memory management?
   - Data structures?

2. **Which debugging tools do you use most?**
   - GDB for assembly?
   - Valgrind for memory?
   - Print statements?

3. **Do you need any specific CS61C tooling?**
   - RISC-V simulators?
   - Assembly syntax highlighting?
   - Makefile templates?

---

### Text Editor Project

4. **What language/framework are you using?**
   - Rust (assumed)?
   - C?
   - Another language?

5. **What development features do you need?**
   - Automated testing?
   - File watching?
   - Hot reload?
   - Linting?

---

### Machine Usage

6. **Do you ever use both machines on the same day?**
   - Yes: Need conflict resolution automation
   - No: Simpler sync strategy

7. **Do you work on CS61C or editor project on weekends only?**
   - Affects weekend-specific automation

8. **Any file conflicts when switching machines?**
   - Current solutions: git stash, manual merge
   - Desired: automatic conflict resolution

---

### Automation Preferences

9. **Full automation or semi-automated?**
   - Full: Everything runs automatically (launchd, hooks)
   - Semi: Scripts available but run manually

10. **Comfort with system-level automation?**
    - Launchd agents (system-level)?
    - Cron jobs (system-level)?
    - Git hooks (repo-level)?

---

### Priority Ranking

11. **What's your biggest workflow frustration right now?**
    - A) Machine switching time
    - B) Configuration errors
    - C) CS61C tooling
    - D) Text editor development
    - E) Maintenance tasks

12. **Which feature would provide the most value immediately?**
    - A) Quick-sync function
    - B) CS61C tools
    - C) Automation scripts
    - D) Git hooks

---

## Next Steps

1. **Review this plan** - Decide which recommendations align with your needs
2. **Prioritize** - Based on the questions above and current pain points
3. **Start small** - Begin with Quick Wins (under 1 hour total)
4. **Iterate** - Implement phase by phase, testing each
5. **Customize** - Adjust recommendations based on your specific workflow
6. **Document** - Update CHANGELOG.md as you implement
7. **Share** - If helpful, share improvements with the community

---

## Resources

### Automation Tools
- **Launchd:** https://www.launchd.info/ (macOS job scheduler)
- **Git Hooks:** https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- **Stow:** https://www.gnu.org/software/stow/ (symlink management)

### CS61C Resources
- **GDB Documentation:** https://www.gnu.org/software/gdb/documentation/
- **Valgrind:** https://valgrind.org/docs/manual/
- **LLDB:** https://lldb.llvm.org/use/tutorial.html

### Editor Development
- **Rust Book:** https://doc.rust-lang.org/book/
- **Editor Development:** Build Your Own Text Editor (your current resource)

---

## Conclusion

This plan provides a comprehensive roadmap for transforming your dotfiles into a fully automated, professional development environment. By implementing these improvements gradually, you'll achieve:

- **Zero-friction machine switching**
- **Professional CS61C development**
- **Automated text editor workflow**
- **Zero manual maintenance tasks**

**Total Investment:** ~16 hours over 4 weeks
**Lifetime Returns:** Hundreds of hours saved through automation

Start with the Quick Wins, then implement phases at your own pace. Each phase provides immediate value while building toward a fully automated workflow.

---

**Happy automating! 🚀**
