package com.example.scheduledaudio

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * BootReceiver - Stellt Alarme nach Geräteneustart wieder her
 *
 * Alarme gehen bei einem Neustart des Geräts verloren,
 * daher werden sie hier wiederhergestellt.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            restoreAlarm(context)
        }
    }

    /**
     * Stellt den gespeicherten Alarm wieder her
     */
    private fun restoreAlarm(context: Context) {
        val prefs = context.getSharedPreferences("audio_scheduler_prefs", Context.MODE_PRIVATE)
        val isEnabled = prefs.getBoolean("alarm_enabled", false)

        if (isEnabled) {
            val hour = prefs.getInt("alarm_hour", 21)
            val minute = prefs.getInt("alarm_minute", 0)

            val calendar = java.util.Calendar.getInstance().apply {
                set(java.util.Calendar.HOUR_OF_DAY, hour)
                set(java.util.Calendar.MINUTE, minute)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)

                if (before(java.util.Calendar.getInstance())) {
                    add(java.util.Calendar.DAY_OF_MONTH, 1)
                }
            }

            val alarmIntent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                MainActivity.ALARM_REQUEST_CODE,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.setRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent
            )
        }
    }
}
