LAMBDA_SRC_DIR="./resources/lambda_sources/scripts"
LAMBDA_LIB_DIR="./resources/lambda_sources/lib"
TARGET_DIR="./resources/lambda_sources"

find "$TARGET_DIR" -maxdepth 1 -type f -name "*.zip" | xargs rm

# Loop through all subdirectories in the directory
for subdir in "$LAMBDA_SRC_DIR"/*/; do
    subdirname=$(basename "$subdir")
    
    # find "$LAMBDA_LIB_DIR" -maxdepth 1 -type f -name "*.js" | xargs -I {} zip -j "$TARGET_DIR/$subdirname.zip" {} 
    zip -j "$TARGET_DIR/$subdirname.zip" "$subdir"*
done

# Iterate through each JS, MJS, and CJS file in the directory
for file in "${LAMBDA_LIB_DIR}"/*.js "${LAMBDA_LIB_DIR}"/*.mjs "${LAMBDA_LIB_DIR}"/*.cjs; do
    # Check if there are matching files
    if [ -e "$file" ]; then
        # Get the file name without the path
        filename=$(basename -- "$file")
        
        # Create a temporary directory to structure the zip
        temp_dir=$(mktemp -d)
        mkdir -p "${temp_dir}/nodejs"
        cp "$file" "${temp_dir}/nodejs/"
        
        target_abs=$(realpath "${TARGET_DIR}")
        # Zip the file and move it to the target directory
        (
            cd ${temp_dir};
            zip "${target_abs}/${filename%.*}.zip" -r ./;
        )
        
        # Clean up the temporary directory
        rm -r "$temp_dir"
        
    fi
done
