LAMBDA_SRC_DIR="./resources/lambda_sources/scripts"
LAMBDA_LIB_DIR="./resources/lambda_sources/lib"
TARGET_DIR="./resources/lambda_sources"

find "$TARGET_DIR" -maxdepth 1 -type f -name "*.zip" | xargs rm

# Loop through all subdirectories in the directory
for subdir in "$LAMBDA_SRC_DIR"/*/; do
    subdirname=$(basename "$subdir")
    
    find "$LAMBDA_LIB_DIR" -maxdepth 1 -type f -name "*.js" | xargs -I {} zip -j "$TARGET_DIR/$subdirname.zip" {} 
    zip -j "$TARGET_DIR/$subdirname.zip" "$subdir"*
done
