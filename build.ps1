$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force dist | Out-Null
Copy-Item -LiteralPath index.html -Destination dist/index.html
# Publish the website's selected assets, not the full-resolution photo library.
foreach ($folder in @('css','js','assets/fonts','assets/icons','assets/images/hero','assets/images/stories')) {
    $target = Join-Path dist $folder
    New-Item -ItemType Directory -Force $target | Out-Null
    Get-ChildItem -LiteralPath $folder -File | Copy-Item -Destination $target -Force
}
Copy-Item -LiteralPath assets/images/philosophy-primary.jpg,assets/images/philosophy-detail.jpg -Destination dist/assets/images -Force
Write-Output 'Static site build complete.'
