$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force dist | Out-Null
Copy-Item -LiteralPath index.html -Destination dist/index.html
foreach ($folder in @('css', 'js', 'assets')) {
    Copy-Item -LiteralPath $folder -Destination dist -Recurse -Force
}
Write-Output 'Static site build complete.'
