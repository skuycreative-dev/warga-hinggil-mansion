param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "1/4 Typecheck..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "TYPECHECK GAGAL — perbaiki error di atas dulu, jangan lanjut push." -ForegroundColor Red
    exit 1
}
Write-Host "Typecheck OK." -ForegroundColor Green

Write-Host "2/4 Lint..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "LINT GAGAL — perbaiki error di atas dulu, jangan lanjut push." -ForegroundColor Red
    exit 1
}
Write-Host "Lint OK." -ForegroundColor Green

Write-Host "3/4 File yang akan di-commit:" -ForegroundColor Cyan
git add -A
git status --short

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tidak ada perubahan untuk di-commit." -ForegroundColor Yellow
    exit 1
}

Write-Host "4/4 Push ke GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "PUSH GAGAL — kemungkinan ada perubahan baru di GitHub yang belum ada di laptop kamu." -ForegroundColor Red
    Write-Host "Jalankan ini dulu, baru ulangi push:" -ForegroundColor Yellow
    Write-Host "  git pull origin main --rebase" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Yellow
} else {
    Write-Host "PUSH BERHASIL. Buka dashboard Vercel -> Deployments, tunggu status jadi Ready (hijau)." -ForegroundColor Green
}
