# Script to bypass OneDrive file locks in Docker mounts by staging build directories locally.
# It copies the services to a temporary folder outside OneDrive, builds the docker images, and caches them.

$tempDir = "C:\Users\harve\cloudcart-build-temp"

# Clean and recreate temp directory
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$services = @("api-gateway", "user-service", "product-service", "order-service", "inventory-service")

foreach ($service in $services) {
    Write-Host "=== Staging and building $service ==="
    $serviceTemp = Join-Path $tempDir $service
    
    # Create target folder
    New-Item -ItemType Directory -Path $serviceTemp -Force | Out-Null
    
    # Copy files excluding python virtual environments to keep it fast
    Copy-Item -Path "services\$service\*" -Destination $serviceTemp -Recurse -Exclude "*venv*", "__pycache__" -Force
    
    # Run docker build
    docker build -t "cloud-native-microservices-app-$service" $serviceTemp
}

# Stage and build frontend
Write-Host "=== Staging and building frontend ==="
$frontendTemp = Join-Path $tempDir "frontend"
New-Item -ItemType Directory -Path $frontendTemp -Force | Out-Null
Copy-Item -Path "frontend\*" -Destination $frontendTemp -Recurse -Exclude "node_modules", ".next", "out" -Force

docker build -t "cloud-native-microservices-app-frontend" $frontendTemp

Write-Host "=========================================================="
Write-Host "All images staged and built successfully in local cache!"
Write-Host "You can now run: docker-compose up"
Write-Host "=========================================================="
