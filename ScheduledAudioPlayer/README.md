# Scheduled Audio Player

Eine einfache Android-App, die zeitgesteuert eine Audiodatei abspielt (z.B. jeden Abend um 21:00 Uhr).

## Features

- Tägliche Wiedergabe zu einer frei wählbaren Uhrzeit
- Einfache Benutzeroberfläche mit TimePicker
- Funktioniert auch nach Geräteneustart
- Foreground Service für zuverlässige Wiedergabe
- Test-Button zum sofortigen Abspielen

## Installation

1. Projekt in Android Studio öffnen
2. Audiodatei in `app/src/main/res/raw/` legen und in `sample_audio.mp3` umbenennen
3. App auf Gerät installieren

## Verwendung

1. **Zeit wählen**: Tippe auf "Zeit ändern" und wähle die gewünschte Uhrzeit
2. **Alarm aktivieren**: Tippe auf "Alarm aktivieren"
3. **Testen**: Mit "Audio testen" kannst du die Wiedergabe sofort prüfen

## Berechtigungen

Die App benötigt folgende Berechtigungen:

- `SCHEDULE_EXACT_ALARM` - Für präzise Alarm-Planung
- `RECEIVE_BOOT_COMPLETED` - Alarm nach Neustart wiederherstellen
- `FOREGROUND_SERVICE` - Audio im Hintergrund abspielen
- `POST_NOTIFICATIONS` - Benachrichtigung während Wiedergabe

## Projektstruktur

```
ScheduledAudioPlayer/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/example/scheduledaudio/
│           │   ├── MainActivity.kt      # Hauptbildschirm mit UI
│           │   ├── AlarmReceiver.kt     # Empfängt Alarm-Events
│           │   ├── BootReceiver.kt      # Stellt Alarm nach Neustart wieder her
│           │   └── AudioService.kt      # Spielt Audio im Hintergrund ab
│           ├── res/
│           │   ├── layout/              # UI Layouts
│           │   ├── values/              # Farben, Strings, Themes
│           │   ├── drawable/            # Icons und Grafiken
│           │   └── raw/                 # Audiodateien hier ablegen
│           └── AndroidManifest.xml
├── build.gradle
└── settings.gradle
```

## Hinweise

- **Batterieoptimierung**: Für zuverlässige Wiedergabe sollte die Batterieoptimierung für diese App deaktiviert werden
- **Audio Format**: Unterstützt MP3, WAV, OGG, AAC, FLAC
- **Min SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 14 (API 34)

## Entwickelt mit

- Kotlin
- Android Jetpack
- Material Design 3
