const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, 'expense-tracker', '.next')
const dest = path.resolve(__dirname, '.next')
const publicSrc = path.resolve(__dirname, 'expense-tracker', 'public')
const publicDest = path.resolve(__dirname, 'public')

function copyRecursive(srcPath, destPath) {
  const stat = fs.statSync(srcPath)
  if (stat.isDirectory()) {
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })
    for (const item of fs.readdirSync(srcPath)) {
      copyRecursive(path.join(srcPath, item), path.join(destPath, item))
    }
  } else {
    fs.copyFileSync(srcPath, destPath)
  }
}

if (!fs.existsSync(src)) {
  console.error('Source .next not found:', src)
  process.exit(1)
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true })
}
copyRecursive(src, dest)

if (fs.existsSync(publicSrc)) {
  if (fs.existsSync(publicDest)) {
    fs.rmSync(publicDest, { recursive: true, force: true })
  }
  copyRecursive(publicSrc, publicDest)
}
