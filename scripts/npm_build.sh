cd resources/frontend/condor
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    exit 1;
fi

npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    exit 2;
fi

echo '{"message": "Building frontend done!"}'
