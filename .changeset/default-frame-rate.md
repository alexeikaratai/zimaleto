---
"@zimaleto/zima": patch
---

Cap the frame rate at 100 fps by default. Displays up to 100 Hz still draw every frame, while faster ones skip frames, such as 60 fps at 120 Hz, which cuts the snow's CPU use there by about a third. Set `fps: Infinity` to draw every frame.
