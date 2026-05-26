<!--VPP START-->

# Using vpp

When this project already has `vpp` available, prefer it for test commands.

- Use `vpp test` instead of `vp test`.
- Use `vpp test <args...>` instead of `vp test <args...>`.
- Keep using existing Vite+ commands for non-test tasks, such as `vp check`,
  `vp pack`, and `vp run <script>`.
- Fall back to `vp test` only if `vpp` is not available.

<!--VPP END-->
