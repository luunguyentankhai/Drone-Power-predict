# Drone

## Introduction

## Tech Stack & Tools

**python** : 3.12
**uv**: python dependency manager

## Setup Requirements

- **`pip install uv`**
- Run **`uv sync`** to install Python dependencies

## Flow

#### Convert.ipynb

1. Load the original problem data (raw data is a log file)
2. Convert raw data (`drone.parquet`) into flight records (`flight.parquet`)

#### flight_stat.ipynb

3. Perform feature selection to choose conditions that affect drone battery
4. Use a correlation matrix to check for multicollinearity

#### train.ipynb

5. Split the data and train the model with default parameters
6. Predict and evaluate results
7. Optimize model hyperparameters to find the best parameters
8. Retrain the model with the new parameters
9. The model output is energy consumption

## Folder Structure

 .
├──  data
│ ├──  processed
│ └──  raw
├──  eda
│ └──  docs
├── 󰣞 src
│ ├──  config
│ └──  utils
└──  web

