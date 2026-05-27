<!--VPP START-->

# Using vpp

When this project already has `vpp` available, prefer it for check and test
commands.

- Use `vpp check` instead of `vp check`.
- Use `vpp check --fix` instead of `vp check --fix`.
- `vpp check` defaults to `vp check` and forwards arguments unchanged.
- When `vpp.typecheck` is configured, `vpp check` runs `vp fmt`, `vp lint`, and
  the configured type-check command. Built-in type-check runners are `nuxt`
  (`vp exec nuxt typecheck`) and `tsc` (`vp exec tsc --noEmit`).
- Use `vpp test` instead of `vp test`.
- Use `vpp test <args...>` instead of `vp test <args...>`.
- Keep using existing Vite+ commands for other tasks, such as `vp pack` and
  `vp run <script>`.
- Fall back to `vp test` only if `vpp` is not available.

<!--VPP END-->
