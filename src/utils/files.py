from os.path import exists, getsize
import pandas as pd
from src.config.log_files import auto_logger, setup_log

logger = setup_log()


@auto_logger(logger)
def file_conversion(input_path, output_path):
    try:
        df = pd.read_csv(input_path, low_memory=False)

        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str)

        logger.info("Compressing to file .parquet with zstd algorithm")
        df.to_parquet(output_path, engine="pyarrow", compression="zstd", index=False)
        if exists(input_path) and exists(output_path):

            old_size = getsize(input_path) / (1024 * 1024)
            new_size = getsize(output_path) / (1024 * 1024)

            logger.info(
                f"Conversion successful! Original size: {old_size:.2f} MB -> New size: {new_size:.2f} MB"
            )
        return True
    except Exception as e:
        logger.error(f"Error during conversion: {e}")
        return False
