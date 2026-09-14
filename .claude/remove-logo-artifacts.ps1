Add-Type -AssemblyName System.Drawing

function Remove-Artifacts {
    param([string]$Path, [string]$OutPath)

    $img = [System.Drawing.Bitmap]::FromFile($Path)
    $w = $img.Width; $h = $img.Height
    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $data = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = $data.Stride
    $bytes = $stride * $h
    $buf = New-Object byte[] $bytes
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)
    $img.UnlockBits($data)
    $img.Dispose()

    function Clear-Region($buf, $stride, $x0, $y0, $x1, $y1) {
        for ($y = $y0; $y -le $y1; $y++) {
            for ($x = $x0; $x -le $x1; $x++) {
                $idx = $y * $stride + $x * 4
                $buf[$idx + 3] = 0
            }
        }
    }

    # top-left stray gold tick
    Clear-Region $buf $stride 0 16 18 36
    # bottom stray underline below CONSTRUCTION
    Clear-Region $buf $stride 160 292 260 309

    # scattered dust specks (small isolated marks found by component scan)
    $specks = @(
        @(199,214,204,218), @(122,248,128,250), @(349,236,349,241), @(376,217,376,222),
        @(376,206,376,208), @(235,282,235,284), @(67,245,69,245), @(310,281,310,283),
        @(364,243,365,244), @(140,233,142,233), @(138,286,139,286), @(218,254,218,255),
        @(251,240,251,241), @(75,286,76,286), @(250,238,250,239), @(355,209,355,209),
        @(297,219,297,219), @(68,214,68,214), @(296,218,296,218), @(236,212,236,212),
        @(356,210,356,210), @(357,211,357,211), @(74,285,74,285), @(372,288,372,288),
        @(220,288,220,288), @(354,208,354,208), @(374,288,374,288), @(196,287,196,287),
        @(108,287,108,287), @(109,288,109,288), @(373,287,373,287), @(231,245,231,245),
        @(355,233,355,233), @(311,248,311,248), @(148,248,148,248), @(230,244,230,244),
        @(72,238,72,238), @(317,236,317,236), @(72,244,72,244), @(356,234,356,234),
        @(237,226,237,226), @(353,231,353,231), @(298,220,298,220), @(220,222,220,222),
        @(186,135,186,135), @(216,252,216,252), @(167,249,167,249), @(159,232,159,232),
        @(354,232,354,232)
    )
    foreach ($s in $specks) {
        $x0 = [Math]::Max(0, $s[0]-2); $y0 = [Math]::Max(0, $s[1]-2)
        $x1 = [Math]::Min($w-1, $s[2]+2); $y1 = [Math]::Min($h-1, $s[3]+2)
        Clear-Region $buf $stride $x0 $y0 $x1 $y1
    }

    $out = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $outData = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $outData.Scan0, $bytes)
    $out.UnlockBits($outData)
    $out.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
}

$brand = "C:\Users\gor.poxosyan\Downloads\GARON-Construction-FINAL\garon-construction\public\brand"
Remove-Artifacts "$brand\garon-logo-light.png" "$brand\garon-logo-light-fixed.png"
Remove-Artifacts "$brand\garon-logo-dark.png"  "$brand\garon-logo-dark-fixed.png"
"Done"
