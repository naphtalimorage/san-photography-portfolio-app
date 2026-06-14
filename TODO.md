# TODO

## Contact form: send email via Supabase Edge Function
- [x] Wire `src/components/ContactSection.tsx` to call Supabase Edge Function `send-contact-inquiry`

- [ ] Show success toast only when the function returns success
- [ ] Show error toast when the function fails
- [ ] (Follow-up) Ensure Supabase secrets exist: `RESEND_API_KEY` (+ optional `RESEND_FROM`)
- [ ] (Follow-up) Deploy Edge Function if needed and test submission

