param(
  [string]$InputPath,
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Input file not found: $InputPath"
}

$bitmap = $null
$output = $null
$bitmap = [System.Drawing.Bitmap]::new([string]$InputPath)

try {
  $width = $bitmap.Width
  $height = $bitmap.Height
  $output = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  function Clamp([double]$value, [int]$min, [int]$max) {
    if ($value -lt $min) { return $min }
    if ($value -gt $max) { return $max }
    return [int][Math]::Round($value)
  }

  for ($y = 0; $y -lt $height; $y++) {
    $left = $bitmap.GetPixel(0, $y)
    $right = $bitmap.GetPixel($width - 1, $y)

    for ($x = 0; $x -lt $width; $x++) {
      $top = $bitmap.GetPixel($x, 0)
      $bottom = $bitmap.GetPixel($x, $height - 1)
      $source = $bitmap.GetPixel($x, $y)

      $tx = if ($width -le 1) { 0.0 } else { $x / [double]($width - 1) }
      $ty = if ($height -le 1) { 0.0 } else { $y / [double]($height - 1) }

      $rowR = $left.R + (($right.R - $left.R) * $tx)
      $rowG = $left.G + (($right.G - $left.G) * $tx)
      $rowB = $left.B + (($right.B - $left.B) * $tx)

      $colR = $top.R + (($bottom.R - $top.R) * $ty)
      $colG = $top.G + (($bottom.G - $top.G) * $ty)
      $colB = $top.B + (($bottom.B - $top.B) * $ty)

      $bgR = ($rowR + $colR) / 2.0
      $bgG = ($rowG + $colG) / 2.0
      $bgB = ($rowB + $colB) / 2.0

      $diff = [Math]::Sqrt(
        [Math]::Pow($source.R - $bgR, 2) +
        [Math]::Pow($source.G - $bgG, 2) +
        [Math]::Pow($source.B - $bgB, 2)
      )

      $brightnessBoost = [Math]::Max($source.R, [Math]::Max($source.G, $source.B)) - [Math]::Max($bgR, [Math]::Max($bgG, $bgB))
      $score = $diff + ([Math]::Max(0, $brightnessBoost) * 1.2)

      $alpha =
        if ($score -le 12) {
          0
        } elseif ($score -ge 54) {
          255
        } else {
          (($score - 12) / (54 - 12)) * 255
        }

      $output.SetPixel(
        $x,
        $y,
        [System.Drawing.Color]::FromArgb(
          (Clamp $alpha 0 255),
          $source.R,
          $source.G,
          $source.B
        )
      )
    }
  }

  $rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
  $minX = $width
  $minY = $height
  $maxX = 0
  $maxY = 0

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $pixel = $output.GetPixel($x, $y)
      if ($pixel.A -gt 14) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($minX -ge $maxX -or $minY -ge $maxY) {
    throw "No visible logo area detected."
  }

  $padding = 24
  $cropX = [Math]::Max(0, $minX - $padding)
  $cropY = [Math]::Max(0, $minY - $padding)
  $cropWidth = [Math]::Min($width - $cropX, ($maxX - $minX) + ($padding * 2))
  $cropHeight = [Math]::Min($height - $cropY, ($maxY - $minY) + ($padding * 2))

  $cropped = [System.Drawing.Bitmap]::new($cropWidth, $cropHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($cropped)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage(
        $output,
        [System.Drawing.Rectangle]::new(0, 0, $cropWidth, $cropHeight),
        [System.Drawing.Rectangle]::new($cropX, $cropY, $cropWidth, $cropHeight),
        [System.Drawing.GraphicsUnit]::Pixel
      )
    } finally {
      $graphics.Dispose()
    }

    $directory = Split-Path -Parent $OutputPath
    if ($directory -and -not (Test-Path -LiteralPath $directory)) {
      New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $cropped.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $cropped.Dispose()
  }
} finally {
  $bitmap.Dispose()
  if ($output) {
    $output.Dispose()
  }
}
