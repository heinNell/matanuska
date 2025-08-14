package matmobile.com;

import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private LocationPermissionHelper locationPermissionHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize the location permission helper
        locationPermissionHelper = new LocationPermissionHelper(this);

        // Request location permissions when the app starts
        requestLocationPermissions();
    }

    /**
     * Request location permissions
     */
    private void requestLocationPermissions() {
        locationPermissionHelper.requestLocationPermissions(new LocationPermissionHelper.PermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Log.i(TAG, "Location permissions granted");
                // Continue with map initialization or other location features
            }

            @Override
            public void onPermissionDenied() {
                Log.w(TAG, "Location permissions denied");
                // Handle the case when permissions are denied
            }
        });
    }

    /**
     * Handle permission results
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (!locationPermissionHelper.handleRequestPermissionsResult(requestCode, permissions, grantResults)) {
            super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
    }
}
