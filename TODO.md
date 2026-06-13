# TODO

- [x] Implement admin Services sortable table UI (DnD) in `src/pages/Admin.tsx`.
- [x] Add Supabase DB migrations for `services` + seed sample services.
- [ ] Restore missing admin Portfolio upload/cards UI in `src/pages/Admin.tsx` (upload panel + photos gallery + drag sort across all photos).
- [ ] Ensure portfolio add/upload persists to Supabase `photos` and instantly reflects in admin table/cards.
- [ ] Ensure drag reorder updates `photos.sort_order` for all photos.
- [ ] Verify crop/edit flow updates `photos` + `storage` and updates card ordering.
- [ ] Run `npm run build` and verify admin UI renders upload cards.
