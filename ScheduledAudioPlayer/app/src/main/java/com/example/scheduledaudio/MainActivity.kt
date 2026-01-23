package com.example.scheduledaudio

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.scheduledaudio.databinding.ActivityMainBinding
import java.util.Calendar

/**
 * MainActivity - Hauptbildschirm der Scheduled Audio Player App
 *
 * Ermöglicht dem Benutzer:
 * - Eine Uhrzeit für die tägliche Audiowiedergabe festzulegen
 * - Den Alarm zu aktivieren/deaktivieren
 * - Die Audiowiedergabe manuell zu testen
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences
    private lateinit var alarmManager: AlarmManager

    private var selectedHour = 21  // Standard: 21:00 Uhr (abends)
    private var selectedMinute = 0
    private var isAlarmEnabled = false

    // Permission request für Notifications (Android 13+)
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            Toast.makeText(this, "Benachrichtigungen aktiviert", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = getSharedPreferences("audio_scheduler_prefs", Context.MODE_PRIVATE)
        alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager

        loadSettings()
        setupUI()
        checkPermissions()
    }

    /**
     * Lädt gespeicherte Einstellungen
     */
    private fun loadSettings() {
        selectedHour = prefs.getInt("alarm_hour", 21)
        selectedMinute = prefs.getInt("alarm_minute", 0)
        isAlarmEnabled = prefs.getBoolean("alarm_enabled", false)
    }

    /**
     * Speichert aktuelle Einstellungen
     */
    private fun saveSettings() {
        prefs.edit().apply {
            putInt("alarm_hour", selectedHour)
            putInt("alarm_minute", selectedMinute)
            putBoolean("alarm_enabled", isAlarmEnabled)
            apply()
        }
    }

    /**
     * Initialisiert die Benutzeroberfläche
     */
    private fun setupUI() {
        updateTimeDisplay()
        updateAlarmStatus()

        // Zeit auswählen
        binding.btnSelectTime.setOnClickListener {
            showTimePicker()
        }

        // Alarm aktivieren/deaktivieren
        binding.btnToggleAlarm.setOnClickListener {
            toggleAlarm()
        }

        // Audio sofort testen
        binding.btnTestAudio.setOnClickListener {
            testAudio()
        }

        // Audio stoppen
        binding.btnStopAudio.setOnClickListener {
            stopAudio()
        }
    }

    /**
     * Zeigt den TimePickerDialog
     */
    private fun showTimePicker() {
        TimePickerDialog(
            this,
            { _, hourOfDay, minute ->
                selectedHour = hourOfDay
                selectedMinute = minute
                updateTimeDisplay()
                saveSettings()

                // Wenn Alarm aktiv ist, neu planen
                if (isAlarmEnabled) {
                    scheduleAlarm()
                }
            },
            selectedHour,
            selectedMinute,
            true  // 24-Stunden-Format
        ).show()
    }

    /**
     * Aktualisiert die Zeitanzeige
     */
    private fun updateTimeDisplay() {
        val timeString = String.format("%02d:%02d", selectedHour, selectedMinute)
        binding.tvSelectedTime.text = timeString
    }

    /**
     * Aktualisiert die Statusanzeige
     */
    private fun updateAlarmStatus() {
        if (isAlarmEnabled) {
            binding.tvStatus.text = "Alarm aktiv"
            binding.btnToggleAlarm.text = "Alarm deaktivieren"
            binding.statusIndicator.setBackgroundResource(R.drawable.status_active)
        } else {
            binding.tvStatus.text = "Alarm inaktiv"
            binding.btnToggleAlarm.text = "Alarm aktivieren"
            binding.statusIndicator.setBackgroundResource(R.drawable.status_inactive)
        }
    }

    /**
     * Wechselt den Alarmstatus
     */
    private fun toggleAlarm() {
        if (isAlarmEnabled) {
            cancelAlarm()
            isAlarmEnabled = false
            Toast.makeText(this, "Alarm deaktiviert", Toast.LENGTH_SHORT).show()
        } else {
            if (checkAlarmPermission()) {
                scheduleAlarm()
                isAlarmEnabled = true
                Toast.makeText(this, "Alarm aktiviert für ${String.format("%02d:%02d", selectedHour, selectedMinute)}", Toast.LENGTH_SHORT).show()
            }
        }
        saveSettings()
        updateAlarmStatus()
    }

    /**
     * Prüft und fordert Berechtigungen an
     */
    private fun checkPermissions() {
        // Notification Permission für Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    /**
     * Prüft Alarm-Berechtigung für Android 12+
     */
    private fun checkAlarmPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Toast.makeText(this, "Bitte erlaube exakte Alarme in den Einstellungen", Toast.LENGTH_LONG).show()
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                startActivity(intent)
                return false
            }
        }
        return true
    }

    /**
     * Plant den täglichen Alarm
     */
    private fun scheduleAlarm() {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, selectedHour)
            set(Calendar.MINUTE, selectedMinute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)

            // Wenn die Zeit heute schon vorbei ist, auf morgen setzen
            if (before(Calendar.getInstance())) {
                add(Calendar.DAY_OF_MONTH, 1)
            }
        }

        val intent = Intent(this, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Täglicher Alarm
        alarmManager.setRepeating(
            AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        )
    }

    /**
     * Bricht den geplanten Alarm ab
     */
    private fun cancelAlarm() {
        val intent = Intent(this, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }

    /**
     * Spielt Audio sofort zum Testen ab
     */
    private fun testAudio() {
        val intent = Intent(this, AudioService::class.java)
        ContextCompat.startForegroundService(this, intent)
        Toast.makeText(this, "Audio wird abgespielt...", Toast.LENGTH_SHORT).show()
    }

    /**
     * Stoppt die Audiowiedergabe
     */
    private fun stopAudio() {
        val intent = Intent(this, AudioService::class.java)
        stopService(intent)
        Toast.makeText(this, "Audio gestoppt", Toast.LENGTH_SHORT).show()
    }

    companion object {
        const val ALARM_REQUEST_CODE = 1001
    }
}
