# UAV Flight Dataset

## Overview

This dataset contains measurements collected during **209 UAV flight campaigns**. Data were synchronized to approximately **5 Hz** and recorded using onboard sensors including:

- **Wind Sensor:** FT Technologies FT205 ultrasonic anemometer (±0.1 m/s, 10 Hz)
- **GNSS/INS:** MicroStrain 3DM-GX5-45
- **Battery Sensor:** Mauch Electronics PL-200
- **Recorder:** Raspberry Pi Zero W running ROS

---

# Dataset Structure

| File             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `parameters.csv` | Flight-level parameters for every flight.          |
| `flights.zip`    | One CSV per flight containing sensor measurements. |
| `flights.csv`    | Combined dataset containing all flights.           |
| `raw_files.zip`  | Raw ROS bag files for every flight.                |

---

# File Naming

## `flights.zip`

- Each CSV filename corresponds to a flight ID.

## `raw_files.zip`

- Contains numbered folders matching flight IDs.
- Each folder contains a `raw.bag` ROS bag.

---

# Dataset Summary

## parameters.csv

- **Rows:** 209
- **Columns:** 7
- **Missing Values:** None (`NA` reserved)

### Variables

| Variable   | Description                    |
| ---------- | ------------------------------ |
| flight     | Flight identifier              |
| speed      | Cruise speed (m/s)             |
| payload    | Payload mass (g)               |
| altitude   | Planned flight altitude (m)    |
| date       | Flight date (`YYYY-MM-DD`)     |
| local_time | Local start time               |
| route      | Flight route / experiment type |

---

## DATA DESCRIPTION FOR: [flights.csv]

This file combines the data avaliable in flights.zip and parameters.csv in a single CSV file.

1. Number of variables: 28

2. Number of cases/rows: 257,896.

3. Missing data codes: The dataset has no missing data, but in the case of missing codes, the dataset would use "NA" to denote missing data.

| Variable                | Data Type   | Unit           | Description                                                                                                                  |
| ----------------------- | ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `flight`                | Integer     | -              | Unique flight identifier. Each flight represents a complete data recording from takeoff to landing along a predefined route. |
| `time`                  | Numeric     | Seconds (s)    | Time elapsed since the start of the flight.                                                                                  |
| `wind_speed`            | Numeric     | m/s            | Airspeed measured by the anemometer.                                                                                         |
| `wind_angle`            | Numeric     | Degrees (°)    | Direction of airflow through the anemometer relative to true north.                                                          |
| `battery_voltage`       | Numeric     | Volts (V)      | System voltage measured immediately after the battery.                                                                       |
| `battery_current`       | Numeric     | Amperes (A)    | System current measured immediately after the battery.                                                                       |
| `position_x`            | Numeric     | Degrees (°)    | Aircraft longitude.                                                                                                          |
| `position_y`            | Numeric     | Degrees (°)    | Aircraft latitude.                                                                                                           |
| `position_z`            | Numeric     | Meters (m)     | Aircraft altitude above sea level.                                                                                           |
| `orientation_x`         | Numeric     | -              | Quaternion x-component representing aircraft orientation.                                                                    |
| `orientation_y`         | Numeric     | -              | Quaternion y-component representing aircraft orientation.                                                                    |
| `orientation_z`         | Numeric     | -              | Quaternion z-component representing aircraft orientation.                                                                    |
| `orientation_w`         | Numeric     | -              | Quaternion w-component representing aircraft orientation.                                                                    |
| `velocity_x`            | Numeric     | m/s            | Ground velocity along the x-axis.                                                                                            |
| `velocity_y`            | Numeric     | m/s            | Ground velocity along the y-axis.                                                                                            |
| `velocity_z`            | Numeric     | m/s            | Ground velocity along the z-axis.                                                                                            |
| `angular_x`             | Numeric     | rad/s          | Angular velocity about the x-axis.                                                                                           |
| `angular_y`             | Numeric     | rad/s          | Angular velocity about the y-axis.                                                                                           |
| `angular_z`             | Numeric     | rad/s          | Angular velocity about the z-axis.                                                                                           |
| `linear_acceleration_x` | Numeric     | m/s²           | Linear acceleration along the x-axis.                                                                                        |
| `linear_acceleration_y` | Numeric     | m/s²           | Linear acceleration along the y-axis.                                                                                        |
| `linear_acceleration_z` | Numeric     | m/s²           | Linear acceleration along the z-axis.                                                                                        |
| `speed`                 | Numeric     | m/s            | Programmed horizontal ground speed during cruise.                                                                            |
| `payload`               | Numeric     | Grams (g)      | Mass of the payload attached to the aircraft. The payload was a standard USPS Small Flat Rate Box.                           |
| `altitude`              | Numeric     | Meters (m)     | Preset flight altitude reached after vertical takeoff.                                                                       |
| `date`                  | Date        | YYYY-MM-DD     | Date when the flight was conducted.                                                                                          |
| `local_time`            | Time        | 24-hour format | Local start time of the flight.                                                                                              |
| `route`                 | Categorical | -              | Predefined flight path or test scenario. See route definitions below.                                                        |

### Route Definitions

| Route   | Description                                                                                                                                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `R1–R7` | Full flight missions where the drone completed a cruise movement. Differences among routes are due to variations in starting position or cruise altitude. These differences can be observed using `position_x`, `position_y`, and `position_z`. |
| `A1`    | Ground test with **no propellers** and **no motor movement**.                                                                                                                                                                                   |
| `A2`    | Ground test with **no propellers** and **minimum motor movement**.                                                                                                                                                                              |
| `A3`    | Ground test with **propellers installed** and **minimum motor movement**.                                                                                                                                                                       |
| `H`     | Hover test with **no horizontal movement**.                                                                                                                                                                                                     |

# Hardware

| Component      | Model                  |
| -------------- | ---------------------- |
| UAV            | DJI Matrice 100        |
| Wind Sensor    | FT205 Ultrasonic       |
| GNSS / INS     | MicroStrain 3DM-GX5-45 |
| Current Sensor | Mauch PL-200           |

---

# Data Collection

- **Date Range:** 2019-07-04 → 2019-10-24

---

# Notes

- Sensors were synchronized using the ROS `ApproximateTime` policy.
- GPS and IMU measurements were fused using the built-in Kalman filter.
- Raw data are provided as ROS Bag (`.bag`) files.
