package com.inethi
import android.util.Log

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MainActivity : ReactActivity() {

    private val QUERY_ALL_PACKAGES_PERMISSION_REQUEST_CODE = 1234

    override fun getMainComponentName(): String = "inethi"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            override fun createRootView(): ReactRootView {
                return ReactRootView(this@MainActivity)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Request permission only on Android 11 (SDK 30) and above
            requestAllPackagesPermission()
        }
    }

    private fun requestAllPackagesPermission() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.QUERY_ALL_PACKAGES)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(android.Manifest.permission.QUERY_ALL_PACKAGES),
                QUERY_ALL_PACKAGES_PERMISSION_REQUEST_CODE
            )
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == QUERY_ALL_PACKAGES_PERMISSION_REQUEST_CODE) {
            if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                Toast.makeText(this, "QUERY_ALL_PACKAGES permission granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Permission denied to access installed apps", Toast.LENGTH_SHORT).show()
            }
        }
    }

    class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
        override fun getName(): String {
            return "InstalledAppsModule"
        }

        @ReactMethod
    fun getInstalledApps(promise: Promise) {
        val pm: PackageManager = reactApplicationContext.packageManager
        val sdkVersion = Build.VERSION.SDK_INT
        Log.d("SDK_VERSION", "Running on Android SDK: $sdkVersion")

        if (sdkVersion >= Build.VERSION_CODES.Q) { // Android 11 and above
            if (ContextCompat.checkSelfPermission(
                    reactApplicationContext, 
                    android.Manifest.permission.QUERY_ALL_PACKAGES
                ) != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PermissionDenied", "QUERY_ALL_PACKAGES permission is not granted")
                return
            }
        }

        try {
            val packages: List<PackageInfo> = pm.getInstalledPackages(PackageManager.GET_META_DATA)
            val apps = packages.map { packageInfo ->
                mapOf(
                    "packageName" to packageInfo.packageName,
                    "appName" to packageInfo.applicationInfo.loadLabel(pm).toString()
                )
            }
            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }   
}

}
