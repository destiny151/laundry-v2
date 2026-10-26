Build a mobile-first single-page web app using plain HTML, CSS and JavaScript (no frameworks, no build step) so it can be hosted on GitHub Pages. Put everything in index.html, style.css and script.js.

Design brief: "A resident in a building with a shared laundry room needs to find a free time slot, while people regularly forget to remove their clothes on time."

Follow the attached hand-drawn sketches for the screens and flow.

User research findings to design for:
- Users can't tell in advance whether a machine is free, in use, or broken. Several machines are often broken.
- There is no agreed schedule, so users lose their only free day when machines are taken.
- Machines have different sizes (5 kg, 7 kg, 17 kg); large loads don't fit and users must wait for a second round.
- Machine settings are confusing (many temperatures); users don't know which to choose for their clothes.
- Clothes are left in machines after the cycle finishes.

Screens: home with machine status (free / in use with minutes left / broken) and size; booking a slot with clear confirmation and cancel; load-size helper that suggests machines; settings helper that recommends a temperature by clothes type; a "your laundry is done, please collect it" reminder.

Usability rules: show relative times ("finishes in 12 min", "finished 5 min ago"), never contradictory status messages, plain everyday language instead of slot counts, large tap targets.

Use localStorage for bookings and pre-fill realistic sample data.


Please make these changes:
1. Match my sketch: on the home screen, show two big buttons, "Washers" and "Dryers", each with a summary like "2 free · 2 in use · 1 broken". Tapping one shows the list of those machines only.
2. Add a "Finished – waiting for pickup" status (e.g. "finished 8 min ago") for machines where the cycle ended but clothes haven't been collected.
3. Make the sample booking consistent with the machine status and dated today. A machine can't be "in use" while the booking on it says "done".
4. On broken machines, show "Broken" only once.

Fix these:
1. "Finished 1449 min ago" is wrong. Sample finished times should be recent (e.g. 8 min ago). For longer times show hours or days ("2 h ago", "yesterday"), never large minute counts.
2. The booking card and the booking form default date show yesterday (25 Oct). Always use the current date and time from the device.
3. On the booking card, show the time only once.


After "Confirm booking", show a confirmation screen like my sketch 4:
- A big "✓ Booked!" heading
- The details: machine and size, date, time, clothes type and suggested temperature
- The text "We'll remind you when your washing is done."
- Two buttons: "Done" (back to the home screen) and "Cancel booking"
Also show "My booking" near the top of the home screen, so the user sees it without scrolling.


