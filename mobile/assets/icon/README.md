# App icon

`icon.png` is the launcher icon artwork: 1024x1024 PNG, square, full-bleed
(no rounded corners — Android applies the launcher's mask).

The Android icons in `android/app/src/main/res/mipmap-*` and
`drawable-*/ic_launcher_foreground.png` are **generated** from it. After
replacing `icon.png`, regenerate them:

```bash
cd mobile
dart run flutter_launcher_icons
```

Config lives in `pubspec.yaml` under `flutter_launcher_icons:`:

- Legacy icon (Android < 8): the full image.
- Adaptive icon (Android 8+): the image as foreground with a 12% inset over a
  `#1C2438` background. Launchers crop to the centered ~66% (circle,
  squircle…), so keep the important content near the center.
