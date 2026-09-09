$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force dist | Out-Null
Copy-Item -LiteralPath index.html,about.html,services.html,photography.html,films.html,couple-stories.html,stories.html,contact.html,weddings.html -Destination dist/ -Force
# Publish the website's selected assets, not the full-resolution photo library.
foreach ($folder in @('css','js','assets/fonts','assets/icons','assets/images/hero','assets/images/stories','assets/images/services','assets/images/films','assets/images/testimonials','assets/images/signature','assets/images/about','assets/images/footer','assets/images/photography','assets/images/weddings')) {
    $target = Join-Path dist $folder
    New-Item -ItemType Directory -Force $target | Out-Null
    if (Test-Path -LiteralPath $folder) {
        Get-ChildItem -LiteralPath $folder -File | Copy-Item -Destination $target -Force
    }
}
Copy-Item -LiteralPath assets/images/philosophy-primary.jpg,assets/images/philosophy-detail.jpg -Destination dist/assets/images -Force
Write-Output 'Static site build complete.'
