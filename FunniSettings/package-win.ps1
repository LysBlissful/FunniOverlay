try {
    Write-Host "Checking dependencies..."
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..."
        npm install
    }

    Write-Host "Launching Electron..."
    npm run package-win
}
catch {
    Write-Host "An error occurred:"
    Write-Host $_
}
