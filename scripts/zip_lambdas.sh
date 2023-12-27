LAMBDA_SRC_DIR="./resources/lambda_sources/scripts"
TARGET_DIR="./resources/lambda_sources"

find "$TARGET_DIR" -maxdepth 1 -type f -name "*.zip" | xargs rm

# Loop through all subdirectories in the directory
for subdir in "$LAMBDA_SRC_DIR"/*/; do
    find "$TARGET_DIR" -maxdepth 1 -type f -name "*.js" | xargs -I {} cp {} "$subdir"
    # Get the name of the subdirectory
    subdirname=$(basename "$subdir")
    # Zip all the files in the subdirectory and place them in the root of the zip file
    zip -j "$TARGET_DIR/$subdirname.zip" "$subdir"*
done
