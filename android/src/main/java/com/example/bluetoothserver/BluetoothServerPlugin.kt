package com.example.bluetoothserver

import android.bluetooth.*
import android.content.Context
import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod
import org.json.JSONObject
import java.util.*

@CapacitorPlugin(name = "BluetoothServer")
class BluetoothServerPlugin : Plugin() {

    private lateinit var context: Context
    private var bluetoothManager: BluetoothManager? = null
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var gattServer: BluetoothGattServer? = null

    companion object {
        private const val TAG = "BluetoothServerPlugin"
        // UUIDs from the example
        val SERVICE_UUID: UUID = UUID.fromString("0000180D-0000-1000-8000-00805f9b34fb")
        val CHARACTERISTIC_UUID: UUID = UUID.fromString("00002A37-0000-1000-8000-00805f9b34fb")
    }

    override fun load() {
        super.load()
        this.context = getContext()
    }

    private val gattServerCallback = object : BluetoothGattServerCallback() {
        override fun onConnectionStateChange(device: BluetoothDevice?, status: Int, newState: Int) {
            super.onConnectionStateChange(device, status, newState)
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Log.i(TAG, "Device connected: ${device?.address}")
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Log.i(TAG, "Device disconnected: ${device?.address}")
                }
            }
        }

        override fun onCharacteristicReadRequest(
            device: BluetoothDevice?,
            requestId: Int,
            offset: Int,
            characteristic: BluetoothGattCharacteristic?
        ) {
            super.onCharacteristicReadRequest(device, requestId, offset, characteristic)
            if (characteristic?.uuid == CHARACTERISTIC_UUID) {
                Log.i(TAG, "Read request for characteristic ${characteristic.uuid} from ${device?.address}")
                val response = "Hola desde Capacitor!".toByteArray()
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, response)
            } else {
                Log.w(TAG, "Invalid characteristic read request")
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE, 0, null)
            }
        }

        override fun onServiceAdded(status: Int, service: BluetoothGattService?) {
            super.onServiceAdded(status, service)
            Log.i(TAG, "Service ${service?.uuid} added with status $status")
        }
    }

    @PluginMethod
    fun startServer(call: PluginCall) {
        bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        if (bluetoothManager == null) {
            call.reject("BluetoothManager not available.")
            return
        }

        bluetoothAdapter = bluetoothManager?.adapter
        if (bluetoothAdapter?.isEnabled == false) {
            call.reject("Bluetooth is disabled")
            return
        }

        gattServer = bluetoothManager?.openGattServer(context, gattServerCallback)
        if (gattServer == null) {
            call.reject("Failed to open GATT server.")
            return
        }

        val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val characteristic = BluetoothGattCharacteristic(
            CHARACTERISTIC_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_READ
        )

        service.addCharacteristic(characteristic)
        gattServer?.addService(service)

        val ret = JSObject().apply {
            put("status", "started")
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun stopServer(call: PluginCall) {
        try {
            gattServer?.close()
            gattServer = null
            Log.i(TAG, "GATT Server stopped.")
            val ret = JSObject().apply {
                put("status", "stopped")
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping server", e)
            call.reject("Error stopping server: ${e.message}")
        }
    }
}
