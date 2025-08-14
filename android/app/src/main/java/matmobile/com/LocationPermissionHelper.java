package matmobile.com;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Helper class for handling location permissions in the app
 */
public class LocationPermissionHelper {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;
    private final BridgeActivity activity;
    private PermissionCallback permissionCallback;

    public interface PermissionCallback {
        void onPermissionGranted();
        void onPermissionDenied();
    }

    public LocationPermissionHelper(BridgeActivity activity) {
        this.activity = activity;
    }

    /**
     * Check if location permissions are granted, and request them if not
     */
    public void requestLocationPermissions(PermissionCallback callback) {
        this.permissionCallback = callback;

        if (hasLocationPermissions()) {
            permissionCallback.onPermissionGranted();
            return;
        }

        ActivityCompat.requestPermissions(
            activity,
            new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            },
            LOCATION_PERMISSION_REQUEST_CODE
        );
    }

    /**
     * Handle permission request result
     */
    public boolean handleRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode != LOCATION_PERMISSION_REQUEST_CODE) {
            return false;
        }

        boolean permissionGranted = grantResults.length > 0 &&
            (grantResults[0] == PackageManager.PERMISSION_GRANTED ||
             (permissions.length > 1 && grantResults[1] == PackageManager.PERMISSION_GRANTED));

        if (permissionGranted) {
            if (permissionCallback != null) {
                permissionCallback.onPermissionGranted();
            }
        } else {
            if (permissionCallback != null) {
                permissionCallback.onPermissionDenied();
            }
            showPermissionDeniedMessage();
        }

        return true;
    }

    /**
     * Check if we have location permissions
     */
    public boolean hasLocationPermissions() {
        return ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) ==
                   PackageManager.PERMISSION_GRANTED ||
               ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_COARSE_LOCATION) ==
                   PackageManager.PERMISSION_GRANTED;
    }

    /**
     * Show message when permission is denied
     */
    private void showPermissionDeniedMessage() {
        Toast.makeText(activity,
            "Location permissions are required for map functionality",
            Toast.LENGTH_LONG).show();
    }
}
