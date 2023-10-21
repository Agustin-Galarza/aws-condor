LAMBDA_SRC_DIR="./resources/lambda_sources/scripts"
TARGET_DIR="./resources/lambda_sources"

# Loop through all subdirectories in the directory
for subdir in "$LAMBDA_SRC_DIR"/*/; do
    # Get the name of the subdirectory
    subdirname=$(basename "$subdir")
    # Zip all the files in the subdirectory and place them in the root of the zip file
    zip -j "$TARGET_DIR/$subdirname.zip" "$subdir"*
done
