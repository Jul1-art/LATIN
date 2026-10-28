"""Projected orbital camera movement for a flat NASA image/video plane.

No 3D scene reconstruction is implied. Each frame is a texture on a planar
surface, rotated around X and Y and projected through a perspective camera.
All four corners remain outside the viewport, so there are no exposed edges.
"""
import math


def depth_filter(width, height, length, index=0, fps=24, transition=.8):
    """Append to a normalized shot, before its crossfade and before titles.

    The `perspective` expression counter is `in`, starting at zero for each
    input shot. Use an individual filter chain for each shot, not on a montage.
    """
    if width <= 0 or height <= 0 or length <= 2 * transition or fps <= 0:
        raise ValueError('Positive dimensions/fps and a shot longer than two transitions are required.')
    frames = max(1, round(length * fps) - 1)
    ramp = transition * fps
    # Smoothstep (zero velocity at both endpoints) keeps the camera settled
    # while the quote is being read. Only each shot's overlap accelerates.
    incoming = f'(1-clip(in/{ramp:.8f},0,1))'
    outgoing = f'clip((in-({frames}-{ramp:.8f}))/{ramp:.8f},0,1)'
    ease_in = f'({incoming}*{incoming}*(3-2*{incoming}))'
    ease_out = f'({outgoing}*{outgoing}*(3-2*{outgoing}))'
    progress = f'(in/{frames})'
    direction = 1 if index % 2 == 0 else -1
    yaw = f'({direction}*(.20*{ease_in}-.22*{ease_out}+.018*sin(PI*{progress})))'
    pitch = f'({direction}*(.05*{ease_in}-.04*{ease_out}))'
    scale = f'(1.10+.10*{ease_in}+.15*{ease_out})'
    dx = f'({direction}*.010*sin(PI*{progress}))'
    dy = f'(.008*sin(PI*{progress}))'
    coords = []
    for corner, (x, y) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
        # R = Ry(yaw) Rx(pitch). Focal distance is 2.6 plane half-widths.
        camera_x = f'({x}*cos({yaw})+{y}*sin({yaw})*sin({pitch}))'
        camera_y = f'({y}*cos({pitch}))'
        divisor = f'(1+(-{x}*sin({yaw})+{y}*cos({yaw})*sin({pitch}))/2.6)'
        coords.append(f"x{corner}='W/2*(1+{scale}*{camera_x}/{divisor})+W*{dx}'")
        coords.append(f"y{corner}='H/2*(1+{scale}*{camera_y}/{divisor})+H*{dy}'")
    return 'perspective=' + ':'.join(coords) + ':sense=destination:eval=frame:interpolation=cubic'


def verify_safe_framing(samples=1001):
    """Prove viewport corners stay inside the projected convex quadrilateral."""
    for index in (0, 1):
        direction = 1 if index % 2 == 0 else -1
        for frame in range(samples):
            p = frame / (samples - 1)
            entry = max(0, 1 - p * 3.6 / .8)
            exit = min(1, max(0, (p * 3.6 - (3.6 - .8)) / .8))
            entry, exit = entry * entry * (3 - 2 * entry), exit * exit * (3 - 2 * exit)
            yaw = direction * (.20 * entry - .22 * exit + .018 * math.sin(math.pi * p))
            pitch = direction * (.05 * entry - .04 * exit)
            scale = 1.10 + .10 * entry + .15 * exit
            dx, dy = direction * .010 * math.sin(math.pi * p), .008 * math.sin(math.pi * p)
            corners = []
            for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                den = 1 + (-x * math.sin(yaw) + y * math.cos(yaw) * math.sin(pitch)) / 2.6
                corners.append((scale * (x * math.cos(yaw) + y * math.sin(yaw) * math.sin(pitch)) / den + 2 * dx, scale * y * math.cos(pitch) / den + 2 * dy))
            for px, py in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                cross = []
                for (ax, ay), (bx, by) in zip(corners, corners[1:] + corners[:1]):
                    cross.append((bx - ax) * (py - ay) - (by - ay) * (px - ax))
                if not (all(c >= 0 for c in cross) or all(c <= 0 for c in cross)):
                    raise AssertionError((p, index, corners, (px, py)))
    return True


if __name__ == '__main__':
    assert verify_safe_framing()
    print('Safe framing verified for 2002 camera poses; no viewport corner leaves the source plane.')
