#!/usr/bin/env python3
"""Minimal Fountain -> HTML renderer (no external deps).

Handles the subset used by MINE.fountain: title page, acts (#),
scene headings (INT./EXT.), character cues + parentheticals + dialogue,
action, transitions, centered notations (INTERCUT/INSERT/FLASHBACK CUT/
MONTAGE/THE END), and **bold**."""
import re, html, sys

SLUG = re.compile(r'^(INT|EXT|EST|I/E|INT\.?/EXT)\.?\b', re.I)
CUE = re.compile(r"^[A-Z0-9][A-Z0-9 .'\-(\)]*$")
TRANS_WORDS = {'FADE IN', 'FADE OUT', 'SMASH CUT', 'CUT TO', 'DISSOLVE TO',
               'MATCH CUT TO', 'JUMP CUT TO', 'FADE IN:', 'FADE OUT.', 'CUT TO:'}
CENTER_PREFIX = ('INTERCUT', 'INSERT', 'FLASHBACK CUT', 'MONTAGE')


def esc(t):
    return html.escape(t)


def bold(t):
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', esc(t))


def is_transition(line):
    s = line.strip()
    if s.startswith('>'):
        return True
    if s.endswith('TO:'):
        return True
    base = s.rstrip(':.').upper()
    return base in TRANS_WORDS


def is_centered(line):
    s = line.strip()
    if s == 'THE END':
        return 'end'
    for p in CENTER_PREFIX:
        if s.upper().startswith(p):
            return 'montage' if p == 'MONTAGE' else 'center'
    return None


def render(path):
    raw = open(path, encoding='utf-8').read()
    lines = raw.split('\n')
    out = []
    i = 0
    # --- title page ---
    title = []
    while i < len(lines):
        ln = lines[i].strip()
        if ln == '':
            i += 1
            break
        if ln.startswith('.ext'):
            i += 1
            continue
        m = re.match(r'^([A-Za-z][\w ]*):\s*(.*)$', ln)
        if m:
            title.append((m.group(1).strip(), m.group(2).strip()))
            i += 1
        else:
            break
    if title:
        out.append('<div class="titlepage">')
        for k, v in title:
            cls = 'tp-title' if k.lower() == 'title' else 'tp-line'
            out.append(f'<div class="{cls}">{bold(v)}</div>')
        out.append('</div><hr class="tp-rule">')

    # --- body ---
    n = len(lines)
    prev = None  # type of previously emitted block
    note_mode = False
    while i < n:
        ln = lines[i]
        s = ln.strip()
        if s == '':
            prev = None
            i += 1
            continue

        if s.upper().startswith('NOTE TO PRODUCTION'):
            out.append('<div class="note"><strong>NOTE TO PRODUCTION:</strong></div>')
            note_mode = True
            i += 1
            continue
        if note_mode:
            out.append(f'<p class="note-text">{bold(s)}</p>')
            i += 1
            continue

        if s.startswith('# '):
            out.append(f'<h1 class="act">{bold(s[2:].strip())}</h1>')
            prev = 'act'
            i += 1
            continue

        if SLUG.match(s):
            out.append(f'<h2 class="slug">{bold(s)}</h2>')
            prev = 'slug'
            i += 1
            continue

        if is_transition(s):
            txt = s[1:].strip() if s.startswith('>') else s
            out.append(f'<div class="transition">{bold(txt)}</div>')
            prev = 'trans'
            i += 1
            continue

        c = is_centered(s)
        if c:
            if c == 'end':
                out.append('<div class="end">THE END</div>')
            elif c == 'montage':
                out.append(f'<div class="montage">{bold(s)}</div>')
            else:
                out.append(f'<div class="center">{bold(s)}</div>')
            prev = 'center'
            i += 1
            continue

        # parenthetical
        if s.startswith('('):
            out.append(f'<div class="paren">{bold(s)}</div>')
            prev = 'paren'
            i += 1
            continue

        # character cue?
        if CUE.match(s) and not is_transition(s):
            # next non-blank line
            j = i + 1
            while j < n and lines[j].strip() == '':
                j += 1
            nxt = lines[j].strip() if j < n else ''
            looks_cue = (CUE.match(nxt) and not is_transition(nxt)
                         and not SLUG.match(nxt)
                         and not nxt.startswith('('))
            if not looks_cue:
                out.append(f'<div class="cue">{bold(s)}</div>')
                prev = 'cue'
                i += 1
                continue

        # dialogue (follows cue or paren) or action
        if prev in ('cue', 'paren'):
            out.append(f'<div class="dialogue">{bold(s)}</div>')
            prev = 'dialogue'
        else:
            out.append(f'<p class="action">{bold(s)}</p>')
            prev = 'action'
        i += 1

    return '\n'.join(out)


CSS = """
* { box-sizing: border-box; }
body { background:#f4f1ea; color:#1a1a1a; font-family:'Courier New',Courier,monospace;
       margin:0; padding:40px 16px; line-height:1.45; }
.wrap { max-width:760px; margin:0 auto; background:#fffdf7; border:1px solid #d8d2c4;
        padding:48px 56px 64px; box-shadow:0 4px 24px rgba(0,0,0,.12); }
.titlepage { text-align:center; margin:24px 0 8px; }
.tp-title { font-size:30px; font-weight:bold; letter-spacing:1px; margin:8px 0; }
.tp-line { font-size:15px; margin:4px 0; }
.tp-rule { border:0; border-top:2px solid #1a1a1a; margin:28px 0; }
.act { text-align:center; font-size:20px; letter-spacing:3px; text-transform:uppercase;
       margin:40px 0 18px; border-bottom:1px solid #1a1a1a; padding-bottom:6px; }
.slug { font-weight:bold; margin:22px 0 6px; text-transform:uppercase; letter-spacing:.5px; }
.transition { text-align:right; text-transform:uppercase; letter-spacing:1px; margin:10px 0; }
.center { text-align:center; font-style:italic; margin:10px 0; }
.montage { text-align:center; font-weight:bold; margin:10px 0; letter-spacing:1px; }
.end { text-align:center; font-weight:bold; font-size:22px; letter-spacing:4px; margin:30px 0; }
.cue { margin:14px 0 0 0; padding-left:140px; font-weight:bold; text-transform:uppercase; }
.paren { padding-left:170px; margin:0; }
.dialogue { padding-left:90px; margin:0 0 4px; max-width:560px; }
.action { margin:8px 0; text-align:justify; }
.note { margin:30px 0 0; font-style:italic; font-weight:bold; }
.note-text { margin:4px 0; font-style:italic; font-size:14px; }
hr.tp-rule { width:60%; }
footer { text-align:center; color:#888; font-size:12px; margin-top:30px; }
"""

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'MINE.fountain'
    body = render(src)
    doc = (f'<!DOCTYPE html><html><head><meta charset="utf-8">'
           f'<title>MINE — Screenplay</title><style>{CSS}</style></head>'
           f'<body><div class="wrap">{body}'
           f'<footer>Adapted from the personal archive &ldquo;The Truth about '
           f'Rachael and Nate.&rdquo; &middot; Fountain draft</footer></div></body></html>')
    outp = sys.argv[2] if len(sys.argv) > 2 else 'MINE.html'
    open(outp, 'w', encoding='utf-8').write(doc)
    print('wrote', outp, len(doc), 'bytes')
