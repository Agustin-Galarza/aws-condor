cd "${PWD}/resources/frontend/condor"

npm install > /dev/null 2>&1

if [ $? -ne 0 ]; then
    errormessage="Error installing frontend dependencies."
    echo $errormessage
    exit 1
fi

echo '{"message": "Installing frontend dependencies done!"}'

npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    errormessage="Error building frontend."
    echo $errormessage
    exit 1
fi

echo '{"message": "Building frontend done!"}'
