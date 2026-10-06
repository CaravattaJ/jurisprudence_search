@echo off
rem Obtient un jeton d'acces Legifrance (PISTE) et le copie dans le presse-papiers.
rem Rien n'est enregistre : ni identifiants, ni jeton.
title Jeton Legifrance (PISTE)
set "JETON_SELF=%~f0"
powershell -NoProfile -Command "Invoke-Expression (((Get-Content -Raw -Encoding UTF8 -LiteralPath $env:JETON_SELF) -split '(?m)^#POWERSHELL#\r?$', 2)[1])"
echo.
pause
exit /b
#POWERSHELL#
Write-Host ''
Write-Host '  Jeton d''acces Legifrance (PISTE)' -ForegroundColor Cyan
Write-Host '  Les identifiants sont ceux de votre application PISTE, rubrique OAuth.'
Write-Host '  Pour coller une valeur : clic droit dans cette fenetre.'
Write-Host ''
$envChoice = Read-Host '  Environnement : Entree = production, S = bac a sable'
if ($envChoice -match '^\s*[sS]') {
  $url = 'https://sandbox-oauth.piste.gouv.fr/api/oauth/token'; $envName = 'bac a sable'
} else {
  $url = 'https://oauth.piste.gouv.fr/api/oauth/token'; $envName = 'production'
}
$clientId = (Read-Host '  Client ID').Trim()
$secure = Read-Host '  Client Secret (saisie masquee)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$secret = ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)).Trim()
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
Write-Host ''
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  $body = @{ grant_type = 'client_credentials'; client_id = $clientId; client_secret = $secret; scope = 'openid' }
  $r = Invoke-RestMethod -Method Post -Uri $url -Body $body
  if ($r.access_token) {
    Set-Clipboard -Value $r.access_token
    $until = (Get-Date).AddSeconds([int]$r.expires_in).ToString('HH:mm')
    Write-Host ('  OK : jeton copie dans le presse-papiers (' + $envName + '), valable jusqu''a ' + $until + '.') -ForegroundColor Green
    Write-Host '  Collez-le dans la page : Connexion a Legifrance (PISTE), puis Se connecter.'
    if ($envName -eq 'bac a sable') { Write-Host '  Pensez a choisir Bac a sable dans la page.' }
  } else {
    Write-Host '  ECHEC : PISTE a repondu sans jeton.' -ForegroundColor Red
  }
} catch {
  Write-Host '  ECHEC : aucun jeton obtenu.' -ForegroundColor Red
  $detail = ''
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) { $detail = $_.ErrorDetails.Message } else { $detail = $_.Exception.Message }
  if ($detail -match 'invalid_client') {
    Write-Host ('  Identifiants non reconnus pour l''environnement ' + $envName + '.')
    Write-Host '  Verifiez : rubrique OAuth (pas Cles d''API), meme application pour les deux valeurs,'
    Write-Host '  et application de production pour la production, APP_SANDBOX pour le bac a sable.'
  } else {
    Write-Host ('  Detail : ' + $detail)
  }
} finally {
  $secret = $null; $secure = $null; $body = $null
}
