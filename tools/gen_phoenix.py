import math

def feather_use(cx, cy, angle_deg, scale, color, opacity=1.0):
    return f'<use href="#feather" transform="translate({cx:.1f},{cy:.1f}) rotate({angle_deg:.1f}) scale({scale:.2f})" fill="{color}" opacity="{opacity:.2f}"/>'

colors_wing = ["url(#gGold)", "url(#gAmber)", "url(#gOrange)", "url(#gRed)", "url(#gRedDark)"]

parts = []

# Right wing: fan of feathers from shoulder point, upper sweep
shoulder_r = (272, 250)
n = 11
for i in range(n):
    t = i / (n - 1)
    angle = -8 + t * 100          # sweep from -8deg to 92deg (down-out)
    scale = 1.55 - 0.55 * t       # longer near top, shorter near bottom
    color = colors_wing[min(int(t * len(colors_wing)), len(colors_wing)-1)]
    parts.append(feather_use(shoulder_r[0], shoulder_r[1], angle, scale, color, 0.97))

# Right wing secondary inner layer (shorter, richer red, adds depth)
n2 = 7
for i in range(n2):
    t = i / (n2 - 1)
    angle = 0 + t * 78
    scale = 0.95 - 0.35 * t
    color = colors_wing[min(int(t * 3), 2)]
    parts.append(feather_use(shoulder_r[0]-6, shoulder_r[1]+6, angle, scale, color, 0.85))

# Mirror for left wing (scale x by -1 around x=300 center)
def mirror_transform(cx, cy, angle_deg, scale, color, opacity):
    mx = 600 - cx
    return f'<use href="#feather" transform="translate({mx:.1f},{cy:.1f}) rotate({-angle_deg:.1f}) scale({-scale:.2f},{scale:.2f})" fill="{color}" opacity="{opacity:.2f}"/>'

parts_left = []
for i in range(n):
    t = i / (n - 1)
    angle = -8 + t * 100
    scale = 1.55 - 0.55 * t
    color = colors_wing[min(int(t * len(colors_wing)), len(colors_wing)-1)]
    parts_left.append(mirror_transform(shoulder_r[0], shoulder_r[1], angle, scale, color, 0.97))
for i in range(n2):
    t = i / (n2 - 1)
    angle = 0 + t * 78
    scale = 0.95 - 0.35 * t
    color = colors_wing[min(int(t * 3), 2)]
    parts_left.append(mirror_transform(shoulder_r[0]-6, shoulder_r[1]+6, angle, scale, color, 0.85))

# Tail feathers, from base point downward fan
tail_base = (300, 300)
ntail = 5
tail_parts = []
for i in range(ntail):
    t = i / (ntail - 1)
    angle = 150 + t * 60   # around 150..210 deg (pointing down, fanning)
    scale = 1.3 - 0.15 * abs(t - 0.5) * 2
    color = colors_wing[min(int((1-abs(t-0.5)*2) * 2), 3)]
    tail_parts.append(feather_use(tail_base[0], tail_base[1], angle, scale*1.4, color, 0.92))

all_svg = "\n    ".join(parts + parts_left + tail_parts)
with open("F:/OneDrive/Documentos/web masajes/fenix-jacuzzi-spa/tools/phoenix_feathers.svg.txt", "w", encoding="utf-8") as f:
    f.write(all_svg)
print("done", len(parts)+len(parts_left)+len(tail_parts), "feathers")
