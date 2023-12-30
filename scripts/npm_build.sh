cd resources/frontend/condor
errormessage=`npm install > /dev/null 2>&1 `
if $errormessage; then
    echo "{\"error\": \"$errormessage\"}";
    exit;
fi

errormessage=`npm run build > /dev/null 2>&1 `
if $errormessage; then
    echo "{\"error\": \"$errormessage\"}";
    exit;
fi

echo '{"message": "Building frontend done!"}'
