param(
  [int]$Port = 5173,
  [switch]$HostAll,
  [switch]$ForcePort
)

$ErrorActionPreference = "Stop"

$frontendPath = Join-Path $PSScriptRoot "frontend"
$packageJsonPath = Join-Path $frontendPath "package.json"

if (-not (Test-Path $packageJsonPath)) {
  throw "Nao encontrei frontend/package.json em: $frontendPath"
}

try {
  Push-Location $frontendPath

  if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules nao encontrado. Instalando dependencias..."
    & npm.cmd install
  }

  if ($ForcePort) {
    $line = netstat -ano | Select-String ":$Port\s+.*LISTENING" | Select-Object -First 1
    if ($line) {
      $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
      $pid = $parts[-1]
      if ($pid -match "^\d+$") {
        Write-Host "Porta $Port em uso pelo PID $pid. Encerrando..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      }
    }
  }

  $viteArgs = @("run", "dev", "--", "--port", "$Port")
  if ($HostAll) {
    $viteArgs += @("--host", "0.0.0.0")
  }

  Write-Host "Subindo frontend com Vite em http://localhost:$Port ..."
  & npm.cmd @viteArgs
}
finally {
  Pop-Location
}
