// src/hooks/useWialonReports.ts
import { useState, useCallback } from 'react';
import { wialonDataManager } from '../services/WialonDataManager';
import type { WialonReportConfig, WialonReportProcessed } from '../types/wialon-complete';

interface UseWialonReportsResult {
  executeReport: (config: WialonReportConfig) => Promise<WialonReportProcessed>;
  loading: boolean;
  error: Error | null;
}

/**
 * Phase 2: Hook for Wialon reports functionality
 * Integrates with WialonServiceComplete and WialonDataManager
 */
export const useWialonReports = (): UseWialonReportsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeReport = useCallback(async (config: WialonReportConfig): Promise<WialonReportProcessed> => {
    setLoading(true);
    setError(null);

    try {
      // Use the data manager which has report execution capabilities
      const result = await wialonDataManager.executeReport(config);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to execute report');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executeReport,
    loading,
    error,
  };
};
"reportProps": {
    "speedLimit": 0,
    "maxMessagesInterval": 0,
    "dailyEngineHoursRate": 0,
    "urbanMaxSpeed": 0,
    "mileageCoefficient": 0,
    "fuelRateCoefficient": 51,
    "speedingTolerance": 10,
    "speedingMinDuration": 1,
    "speedingMode": 0,
    "driver_activity": { "type": 0 },
    "fuelConsRates": {
      "consSummer": 51,
      "consWinter": 51,
      "winterMonthFrom": 11,
      "winterDayFrom": 1,
      "winterMonthTo": 1,
      "winterDayTo": 29
    }
  },
  "aliases": [
    {
      "id": 1,
      "n": "Setparam 2007",
      "c": "setparam",
      "l": "tcp",
      "p": "2007|40.119.153.184",
      "a": 1,
      "f": 0,
      "jp": ""
    },
    {
      "id": 2,
      "n": "Setparam 2008",
      "c": "setparam",
      "l": "tcp",
      "p": "2008|8982",
      "a": 1,
      "f": 0,
      "jp": ""
    },
    {
      "id": 3,
      "n": "Setparam 2010",
      "c": "setparam",
      "l": "tcp",
      "p": "2010|2",
      "a": 1,
      "f": 0,
      "jp": ""
    }
  ],
  "driving": {
    "acceleration": [
      { "flags": 2, "min_value": 0.4, "name": "Acceleration: extreme", "penalties": 2000 },
      {
        "flags": 2,
        "max_value": 0.4,
        "min_value": 0.31,
        "name": "Acceleration: medium",
        "penalties": 1000
      }
    ],
    "brake": [
      { "flags": 2, "min_value": 0.35, "name": "Brake: extreme", "penalties": 2000 },
      {
        "flags": 2,
        "max_value": 0.35,
        "min_value": 0.31,
        "name": "Brake: medium",
        "penalties": 1000
      }
    ],
    "global": { "accel_mode": "0" },
    "harsh": [{ "flags": 2, "min_value": 0.3, "name": "Harsh driving", "penalties": 300 }],
    "speeding": [
      {
        "flags": 0,
        "max_duration": 30,
        "max_value": 100,
        "min_duration": 10,
        "min_value": 85,
        "name": "Speeding: extreme",
        "penalties": 5000
      }
    ],
    "turn": [
      { "flags": 2, "min_value": 0.4, "name": "Turn: extreme", "penalties": 1000 },
      { "flags": 2, "max_value": 0.4, "min_value": 0.31, "name": "Turn: medium", "penalties": 500 }
    ]
  },
  "trip": {
    "type": 1,
    "gpsCorrection": 1,
    "minSat": 2,
    "minMovingSpeed": 1,
    "minStayTime": 300,
    "maxMessagesDistance": 10000,
    "minTripTime": 60,
    "minTripDistance": 100
  }
}
"reports": [
  {
    "id": 2,
    "n": "MATANUSKA DAILY SUMMARY- ALL VALUES",
    "ct": "avl_unit",
    "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
    "tbl": [
      {
        "n": "unit_stays",
        "l": "Parkings",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_stays_markers\"]",
        "sl": "[\"Parking markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_videos",
        "l": "Video",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_unit_videos\"]",
        "sl": "[\"Video markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_photos",
        "l": "Images",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_unit_photos\"]",
        "sl": "[\"Image markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_events",
        "l": "Events",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_events_markers\"]",
        "sl": "[\"Event markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_fillings",
        "l": "Fuel fillings and battery charges",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_filling_markers\"]",
        "sl": "[\"Filling markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_speedings",
        "l": "Speedings",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_speedings_markers\"]",
        "sl": "[\"Speeding markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_thefts",
        "l": "Fuel drains",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"chart_theft_markers\"]",
        "sl": "[\"Drain markers\"]",
        "filter_order": [],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_stats",
        "l": "Statistics",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"address_format\",\"time_format\",\"us_units\",\"deviation\",\"averaging\"]",
        "sl": "[\"Address\",\"Time Format\",\"Measure\",\"Deviation\",\"Averaging\"]",
        "filter_order": [],
        "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%Y-%m-%E_%H:%M:%S\",\"us_units\":0,\"deviation\":\"30\",\"averaging\":\"none\"}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_trips",
        "l": "Trip Report",
        "c": "[\"time_begin\",\"location_begin\",\"coord_begin\",\"time_end\",\"location_end\",\"coord_end\",\"duration\",\"duration_ival\",\"eh_duration\",\"mileage\",\"absolute_mileage_begin\",\"absolute_mileage_end\",\"avg_speed\",\"max_speed\",\"trips_count\",\"fuel_consumption_all\",\"avg_fuel_consumption_all\",\"fuel_level_begin\",\"fuel_level_end\",\"fuel_level_max\",\"fuel_level_min\",\"dummy\"]",
        "cl": "[\"Beginning\",\"Initial location\",\"Initial coordinates\",\"End\",\"Final location\",\"Final coordinates\",\"Duration\",\"Total time\",\"Engine hours\",\"Mileage\",\"Initial mileage\",\"Final mileage\",\"Avg speed\",\"Max speed\",\"Trips count\",\"Consumed\",\"Avg consumption\",\"Initial fuel level\",\"Final fuel level\",\"Max fuel level\",\"Min fuel level\",\"Notes\"]",
        "cp": "[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "duration",
          "mileage",
          "base_eh_sensor",
          "engine_hours",
          "speed",
          "stops",
          "sensors",
          "sensor_name",
          "driver",
          "trailer",
          "geozones_ex"
        ],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_fillings",
        "l": "Fuel fillings",
        "c": "[\"time_end\",\"location_end\",\"fuel_level_begin\",\"fuel_level_filled\",\"filled\",\"difference\",\"absolute_mileage_begin\",\"registered\",\"sensor_name\"]",
        "cl": "[\"Time\",\"Location\",\"Initial fuel level\",\"Final fuel level\",\"Filled\",\"Difference\",\"Mileage\",\"Registered filling\",\"Sensor name\"]",
        "cp": "[{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "geozones_ex",
          "fillings",
          "charges",
          "driver",
          "trailer",
          "sensor_name",
          "custom_sensor_name"
        ],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_thefts",
        "l": "Fuel thefts",
        "c": "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"fuel_level_begin\",\"initial_speed\",\"thefted\",\"fuel_level_thefted\",\"final_speed\",\"dummy\"]",
        "cl": "[\"Beginning\",\"Initial location\",\"Time\",\"Final location\",\"Initial fuel level\",\"Initial speed\",\"Stolen\",\"Final fuel level\",\"Final speed\",\"Notes\"]",
        "cp": "[{},{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "geozones_ex",
          "thefts",
          "driver",
          "trailer",
          "sensor_name",
          "custom_sensor_name"
        ],
        "p": "{\"thefts\":{\"type\":1,\"min\":5,\"max\":100,\"summarize\":1}}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_speedings",
        "l": "Speedings",
        "c": "[\"time_begin\",\"location_begin\",\"duration\",\"duration_ival\",\"max_speed\",\"speed_limit\",\"avg_speed\",\"speedings_count\"]",
        "cl": "[\"Beginning\",\"Location\",\"Duration\",\"Total time\",\"Max speed\",\"Speed limit\",\"Avg speed\",\"Count\"]",
        "cp": "[{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "duration",
          "mileage",
          "driver",
          "trailer",
          "geozones_ex"
        ],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_generic",
        "l": "Summary",
        "c": "[\"mileage\",\"eh\",\"duration_stay\",\"fuel_consumption_fls\",\"dist_fuel_consumption_fls\",\"fuel_level_begin\",\"fuel_level_end\",\"fillings_count\",\"thefts_count\",\"filled\",\"thefted\"]",
        "cl": "[\"Mileage in trips\",\"Engine hours\",\"Parkings\",\"Consumed by FLS\",\"Avg mileage per unit of fuel by FLS\",\"Initial fuel level\",\"Final fuel level\",\"Total fillings\",\"Total thefts\",\"Filled\",\"Stolen\"]",
        "cp": "[{},{},{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "base_eh_sensor",
          "sensor_name"
        ],
        "p": "{\"custom_interval\":{\"type\":0}}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_chart",
        "l": "FUEL LEVEL/ SPEED CHART",
        "c": "[\"instant_speed_base\",\"instant_speed_smooth\",\"fuel_level\",\"rpm_sensors_base\",\"rpm_sensors_smooth\"]",
        "cl": "[\"Speed\",\"Speed (smoothed)\",\"Fuel level\",\"Engine revs\",\"Engine revs (smoothed)\"]",
        "cp": "",
        "s": "",
        "sl": "",
        "filter_order": [],
        "p": "{\"chart_markers\":{\"f\":2428}}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      }
    ],
    "bsfl": {
      "ct": 1663927697,
      "mt": 1741791078
    }
  },
  {
    "id": 1,
    "n": "Matanuska Fuel report",
    "ct": "avl_unit",
    "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
    "tbl": [
      {
        "n": "unit_stats",
        "l": "Statistics",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"address_format\",\"time_format\",\"us_units\"]",
        "sl": "[\"Address\",\"Time Format\",\"Measure\"]",
        "filter_order": [],
        "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E.%m.%Y_%H:%M:%S\",\"us_units\":0}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_fillings",
        "l": "Fuel fillings",
        "c": "[\"time_end\",\"location_end\",\"fuel_level_begin\",\"fuel_level_filled\",\"filled\",\"filling_description\",\"sensor_name\",\"absolute_mileage_begin\"]",
        "cl": "[\"Time\",\"Location\",\"Initial fuel level\",\"Final fuel level\",\"Filled\",\"Description\",\"Sensor name\",\"Mileage\"]",
        "cp": "[{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "geozones_ex",
          "fillings",
          "driver",
          "trailer",
          "sensor_name",
          "custom_sensor_name"
        ],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_thefts",
        "l": "Fuel thefts",
        "c": "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"fuel_level_begin\",\"initial_speed\",\"thefted\",\"fuel_level_thefted\",\"final_speed\",\"absolute_mileage_begin\"]",
        "cl": "[\"Beginning\",\"Initial location\",\"Time\",\"Final location\",\"Initial fuel level\",\"Initial speed\",\"Stolen\",\"Final fuel level\",\"Final speed\",\"Mileage\"]",
        "cp": "[{},{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "geozones_ex",
          "thefts",
          "driver",
          "trailer",
          "sensor_name",
          "custom_sensor_name"
        ],
        "p": "",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_generic",
        "l": "Summary",
        "c": "[\"mileage\",\"avg_speed\",\"max_speed\",\"eh\",\"fuel_consumption_fls\",\"avg_fuel_consumption_fls\",\"fuel_level_begin\",\"fuel_level_end\",\"fillings_count\",\"thefts_count\"]",
        "cl": "[\"Mileage in trips\",\"Avg speed\",\"Max speed\",\"Engine hours\",\"Consumed by FLS\",\"Avg consumption by FLS\",\"Initial fuel level\",\"Final fuel level\",\"Total fillings\",\"Total thefts\"]",
        "cp": "[{},{},{},{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "base_eh_sensor",
          "sensor_name"
        ],
        "p": "{\"custom_interval\":{\"type\":0}}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      }
    ],
    "bsfl": {
      "ct": 1646737127,
      "mt": 1646737127
    }
  },
  {
    "id": 3,
    "n": "New report",
    "ct": "avl_unit",
    "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
    "tbl": [
      {
        "n": "unit_stats",
        "l": "Statistics",
        "c": "",
        "cl": "",
        "cp": "",
        "s": "[\"address_format\",\"time_format\",\"us_units\",\"deviation\",\"averaging\"]",
        "sl": "[\"Address\",\"Time Format\",\"Measure\",\"Deviation\",\"Averaging\"]",
        "filter_order": [],
        "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E.%m.%Y_%H:%M:%S\",\"us_units\":0,\"deviation\":\"30\",\"averaging\":\"none\"}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      },
      {
        "n": "unit_stops",
        "l": "Stops",
        "c": "[\"time_begin\",\"time_end\",\"duration\",\"duration_ival\",\"duration_prev\",\"location\",\"coord\"]",
        "cl": "[\"Beginning\",\"End\",\"Duration\",\"Total time\",\"Off-time\",\"Location\",\"Coordinates\"]",
        "cp": "[{},{},{},{},{},{},{}]",
        "s": "",
        "sl": "",
        "filter_order": [
          "duration",
          "sensors",
          "sensor_name",
          "driver",
          "trailer",
          "fillings",
          "thefts",
          "charges",
          "geozones_ex"
        ],
        "p": "{\"duration\":{\"min\":7200,\"flags\":1,\"max\":86400},\"sensors\":{\"type\":1,\"min\":7200,\"flags\":1,\"max\":86400},\"geozones_ex\":{\"zones\":\"24979429_100,600541672_100,600590053_100,600610518_100,600614258_100,600665449_100,600672382_100,600695231_100,600702514_100,600754126_100,600769948_100\",\"types\":\"0,0,0,0,0,0,0,0,0,0,0\",\"flags\":0}}",
        "sch": {
          "f1": 0,
          "f2": 0,
          "t1": 0,
          "t2": 0,
          "m": 0,
          "y": 0,
          "w": 0,
          "fl": 0
        },
        "f": 0
      }
    ],
    "bsfl": {
      "ct": 1743686051,
      "mt": 1743686051
    }
  }
]
}
