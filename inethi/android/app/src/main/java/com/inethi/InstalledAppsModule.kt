package com.inethi

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.Manifest
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "InstalledAppsModule"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.QUERY_ALL_PACKAGES) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PermissionDenied", "QUERY_ALL_PACKAGES permission is not granted")
            return
        }

        try {
            val pm: PackageManager = reactApplicationContext.packageManager
            val packages: List<PackageInfo> = pm.getInstalledPackages(PackageManager.GET_META_DATA)
            val appsArray: WritableArray = WritableNativeArray()

            for (packageInfo in packages) {
                val app: WritableMap = WritableNativeMap()
                app.putString("packageName", packageInfo.packageName)
                app.putString("appName", packageInfo.applicationInfo.loadLabel(pm).toString())
                appsArray.pushMap(app)
            }

            promise.resolve(appsArray)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }
}
