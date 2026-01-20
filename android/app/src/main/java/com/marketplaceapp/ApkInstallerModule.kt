package com.marketplaceapp

import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class ApkInstallerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ApkInstaller"
    }

    @ReactMethod
    fun install(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "APK file does not exist: $filePath")
                return
            }

            val context = reactApplicationContext
            val intent = Intent(Intent.ACTION_VIEW)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // For Android 7.0+ use FileProvider
                FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    file
                )
            } else {
                // For older versions use file URI
                Uri.fromFile(file)
            }

            intent.setDataAndType(uri, "application/vnd.android.package-archive")
            
            context.startActivity(intent)
            promise.resolve("Installation started")
            
        } catch (e: Exception) {
            promise.reject("INSTALL_ERROR", "Failed to install APK: ${e.message}", e)
        }
    }
}
