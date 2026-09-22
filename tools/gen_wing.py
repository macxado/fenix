import math

def polar(cx, cy, angle_deg, r):
    a = math.radians(angle_deg)
    # angle 0 = pointing straight up, positive = sweeping to the right
    return (cx + r * math.sin(a), cy - r * math.cos(a))

def jagged_path(cx, cy, angle_start, angle_end, r_long, r_short, teeth, base_pull=0.55):
    """Outer jagged edge from angle_start to angle_end alternating long/short radius,
    then smooth curve back to origin (the shoulder point)."""
    pts = []
    n = teeth * 2
    for i in range(n + 1):
        t = i / n
        angle = angle_start + (angle_end - angle_start) * t
        r = r_long if i % 2 == 0 else r_short
        pts.append(polar(cx, cy, angle, r))
    d = f"M {cx:.1f},{cy:.1f} L {pts[0][0]:.1f},{pts[0][1]:.1f} "
    for p in pts[1:]:
        d += f"L {p[0]:.1f},{p[1]:.1f} "
    # smooth return to shoulder via quadratic control point pulled toward center
    last = pts[-1]
    ctrl_x = cx + (last[0]-cx) * base_pull
    ctrl_y = cy + (last[1]-cy) * base_pull + 40
    d += f"Q {ctrl_x:.1f},{ctrl_y:.1f} {cx:.1f},{cy:.1f} Z"
    return d

shoulder = (300, 258)

layers = [
    # (angle_start, angle_end, r_long, r_short, teeth)
    (-6, 100, 250, 190, 6),   # back glow (red-dark) — longest
    (-4, 92, 215, 165, 6),    # mid (red-fire)
    (-2, 84, 178, 138, 5),    # mid (orange)
    (0, 74, 138, 108, 5),     # inner (amber)
    (2, 62, 96, 74, 4),       # core (gold) — shortest, closest to body
]

names = ["wingGlow", "wingRed", "wingOrange", "wingAmber", "wingGold"]

out = []
for name, (a0, a1, rl, rs, teeth) in zip(names, layers):
    d = jagged_path(shoulder[0], shoulder[1], a0, a1, rl, rs, teeth)
    out.append((name, d))

with open("F:/OneDrive/Documentos/web masajes/fenix-jacuzzi-spa/tools/wing_paths.txt", "w", encoding="utf-8") as f:
    for name, d in out:
        f.write(name + "|" + d + "\n")

print("done")

# Tail — hangs down from base point, narrower angular spread
tail_base = (300, 295)
tail_layers = [
    (140, 220, 165, 125, 5),
    (145, 215, 142, 108, 5),
    (150, 210, 116, 90, 4),
    (155, 205, 90, 70, 4),
    (162, 198, 62, 48, 3),
]
tail_names = ["tailGlow", "tailRed", "tailOrange", "tailAmber", "tailGold"]
tail_out = []
for name, (a0, a1, rl, rs, teeth) in zip(tail_names, tail_layers):
    d = jagged_path(tail_base[0], tail_base[1], a0, a1, rl, rs, teeth, base_pull=0.5)
    tail_out.append((name, d))

with open("F:/OneDrive/Documentos/web masajes/fenix-jacuzzi-spa/tools/tail_paths.txt", "w", encoding="utf-8") as f:
    for name, d in tail_out:
        f.write(name + "|" + d + "\n")
print("tail done")

# Left wing = mirror of right wing across x = shoulder_x
def jagged_path_mirrored(cx, cy, angle_start, angle_end, r_long, r_short, teeth, base_pull=0.55):
    return jagged_path(cx, cy, -angle_start, -angle_end, r_long, r_short, teeth, base_pull)

left_out = []
for name, (a0, a1, rl, rs, teeth) in zip(names, layers):
    d = jagged_path_mirrored(shoulder[0], shoulder[1], a0, a1, rl, rs, teeth)
    left_out.append((name.replace("wing","wingL"), d))

with open("F:/OneDrive/Documentos/web masajes/fenix-jacuzzi-spa/tools/wing_left_paths.txt", "w", encoding="utf-8") as f:
    for name, d in left_out:
        f.write(name + "|" + d + "\n")
print("left wing done")
