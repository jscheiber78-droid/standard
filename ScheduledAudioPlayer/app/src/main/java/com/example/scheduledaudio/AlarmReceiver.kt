package com.example.scheduledaudio

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

/**
 * AlarmReceiver - Empfängt Alarm-Events vom AlarmManager
 *
 * Wird zur geplanten Zeit aufgerufen und startet den AudioService
 * für die Wiedergabe der Audiodatei.
 */
class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // AudioService starten für Hintergrundwiedergabe
        val serviceIntent = Intent(context, AudioService::class.java)
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}
