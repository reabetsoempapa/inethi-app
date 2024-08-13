package com.inethi

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

class InstalledAppsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<ReactContextBaseJavaModule> {
        return listOf(InstalledAppsModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return Collections.emptyList()
    }
}
