import json, re, sys
from PIL import Image
base='/home/claude/baram/public/gfx/'
js=open(base+'chars.js').read(); A=json.loads(js[js.index('=')+1:].strip().rstrip(';'))
img=Image.open(base+'chars.png').convert('RGBA')
bad=[]
for bk,rows in A['frames'].items():
    for d,want in ((1,'L'),(2,'R')):
        R=A['rects'][rows[d][1]]; c=img.crop((R[0],R[1],R[0]+R[2],R[1]+R[3])); w,h=c.size
        px=c.load(); xs=[]
        for y in range(int(h*0.12),int(h*0.42)):
            for x in range(w):
                r,g,b,a=px[x,y]
                if a>200 and r>200 and 150<g<215 and 110<b<190 and r>g>b: xs.append(x)
        if len(xs)<5: continue
        cx=sum(xs)/len(xs); side='L' if cx<w/2 else 'R'
        if side!=want: bad.append(f'{bk} 방향{d}')
print('OK' if not bad else '얼굴 방향 반대: '+', '.join(bad))
