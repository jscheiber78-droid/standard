package com.example.scheduledaudio

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * AudioService - Foreground Service für Audio-Wiedergabe
 *
 * Spielt die Audiodatei im Hintergrund ab und zeigt eine
 * Benachrichtigung an, damit der Benutzer die Wiedergabe
 * kontrollieren kann.
 */
class AudioService : Service() {

    private var mediaPlayer: MediaPlayer? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Foreground Service mit Benachrichtigung starten
        startForeground(NOTIFICATION_ID, createNotification())

        // Audio abspielen
        playAudio()

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        stopAudio()
    }

    /**
     * Erstellt den Notification Channel (erforderlich ab Android 8.0)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Audio Player",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Zeigt an, wenn Audio abgespielt wird"
                setSound(null, null)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Erstellt die Benachrichtigung für den Foreground Service
     */
    private fun createNotification(): Notification {
        val mainIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            mainIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Scheduled Audio Player")
            .setContentText("Audio wird abgespielt...")
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    /**
     * Startet die Audio-Wiedergabe
     */
    private fun playAudio() {
        try {
            // Stoppe vorherige Wiedergabe falls vorhanden
            stopAudio()

            // MediaPlayer mit der Audiodatei aus res/raw initialisieren
            mediaPlayer = MediaPlayer.create(this, R.raw.sample_audio)
            mediaPlayer?.apply {
                setOnCompletionListener {
                    // Service beenden wenn Audio fertig ist
                    stopSelf()
                }
                setOnErrorListener { _, _, _ ->
                    stopSelf()
                    true
                }
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    /**
     * Stoppt die Audio-Wiedergabe und gibt Ressourcen frei
     */
    private fun stopAudio() {
        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
            }
            release()
        }
        mediaPlayer = null
    }

    companion object {
        const val NOTIFICATION_ID = 1
        const val CHANNEL_ID = "audio_player_channel"
    }
}
