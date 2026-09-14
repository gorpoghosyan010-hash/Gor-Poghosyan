Add-Type -AssemblyName System.Drawing

function Get-Components {
    param([string]$Path, [int]$AlphaThreshold = 200)

    $img = [System.Drawing.Bitmap]::FromFile($Path)
    $w = $img.Width; $h = $img.Height
    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $data = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = $data.Stride
    $bytes = $stride * $h
    $buf = New-Object byte[] $bytes
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)
    $img.UnlockBits($data)
    $img.Dispose()

    $mask = New-Object bool[] ($w * $h)
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $y * $stride + $x * 4
            $a = $buf[$idx + 3]
            if ($a -gt $AlphaThreshold) { $mask[$y * $w + $x] = $true }
        }
    }

    $visited = New-Object bool[] ($w * $h)
    $components = @()
    $queueX = New-Object System.Collections.Generic.Queue[int]
    $queueY = New-Object System.Collections.Generic.Queue[int]

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $i = $y * $w + $x
            if ($mask[$i] -and -not $visited[$i]) {
                $visited[$i] = $true
                $queueX.Clear(); $queueY.Clear()
                $queueX.Enqueue($x); $queueY.Enqueue($y)
                $minX=$x; $maxX=$x; $minY=$y; $maxY=$y; $count=0
                while ($queueX.Count -gt 0) {
                    $cx = $queueX.Dequeue(); $cy = $queueY.Dequeue()
                    $count++
                    if ($cx -lt $minX) { $minX = $cx }
                    if ($cx -gt $maxX) { $maxX = $cx }
                    if ($cy -lt $minY) { $minY = $cy }
                    if ($cy -gt $maxY) { $maxY = $cy }
                    foreach ($d in @(@(1,0),@(-1,0),@(0,1),@(0,-1))) {
                        $nx = $cx + $d[0]; $ny = $cy + $d[1]
                        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                            $ni = $ny * $w + $nx
                            if ($mask[$ni] -and -not $visited[$ni]) {
                                $visited[$ni] = $true
                                $queueX.Enqueue($nx); $queueY.Enqueue($ny)
                            }
                        }
                    }
                }
                $components += [PSCustomObject]@{ MinX=$minX; MinY=$minY; MaxX=$maxX; MaxY=$maxY; Count=$count }
            }
        }
    }
    return $components | Sort-Object Count -Descending
}

$brand = "C:\Users\gor.poxosyan\Downloads\GARON-Construction-FINAL\garon-construction\public\brand"
"=== light (black+gold) ==="
Get-Components "$brand\garon-logo-light.png" | Format-Table -AutoSize
"=== dark (white+gold) ==="
Get-Components "$brand\garon-logo-dark.png" | Format-Table -AutoSize
