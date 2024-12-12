#!/bin/bash

# Define the directory containing the example files
EXAMPLES_DIR="./"
# Define the output file
OUTPUT_FILE="copilot.txt"

# Clear the output file if it exists
> "$OUTPUT_FILE"

# Generate a list of ignored files using git
IGNORED_FILES=$(git ls-files --others --ignored --exclude-standard)

# Find all TypeScript files, excluding node_modules and .d.ts files
find . -name "*.ts" ! -name "*.d.ts" ! -path "*/node_modules/*" | grep -vFf <(echo "$IGNORED_FILES") | while read -r file; do
    # Append the file name to the output file
    echo "### File: $file ###" >> "$OUTPUT_FILE"
    # Append the content of the file to the output file
    cat "$file" >> "$OUTPUT_FILE"
    # Add a newline for separation
    echo -e "\n" >> "$OUTPUT_FILE"
done

echo "All TypeScript example code has been compiled into $OUTPUT_FILE"