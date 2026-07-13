import argparse
import sys

from src.utils.files import file_conversion


def cli():
    parser = argparse.ArgumentParser(description="CLI tool utils")
    subparser = parser.add_subparsers(dest="command", help="Available commands")
    subparser.required = True

    # 'convert file'
    convert_parser = subparser.add_parser("convert", help="Convert a .csv to .parquet")
    convert_parser.add_argument(
        "-i", "--input", help="Path to the dataset(just .csv file"
    )
    convert_parser.add_argument(
        "-o", "--output", help="Path to output dataset", required=True
    )

    args = parser.parse_args()

    if args.command == "convert":
        success = file_conversion(args.input, args.output)
        if not success:
            sys.exit(1)


if __name__ == "__main__":
    cli()
